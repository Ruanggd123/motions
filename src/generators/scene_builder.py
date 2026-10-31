"""
SceneBuilder - Constructs 3D scenes procedurally from config definitions.
Generates characters, environments, lighting and camera setup via bpy.
"""
from __future__ import annotations

import math
from typing import Any


class SceneBuilder:
    """Builds a complete Blender scene from a named scene definition."""

    def __init__(self, config: dict[str, Any]) -> None:
        self.config = config
        self.scene_cfg = config.get("scene", {})
        self.gen_cfg = config.get("generators", {})

    def build(self, scene_name: str) -> dict[str, Any]:
        """
        Build the full scene and return metadata for downstream stages.

        Returns a dict with keys: objects, lights, camera, metadata.
        """
        import bpy  # noqa: F401 — only available inside Blender

        # Clear existing scene data for clean generation
        bpy.ops.wm.read_factory_settings(use_empty=True)

        objects = []
        objects.extend(self._build_environment())
        objects.extend(self._build_character_placeholder())

        lights = self._setup_lighting()
        camera = self._setup_camera()

        return {
            "name": scene_name,
            "objects": objects,
            "lights": lights,
            "camera": camera,
            "metadata": {
                "style": self.scene_cfg.get("style", "low_poly"),
                "palette": self.scene_cfg.get("color_palette", "vibrant"),
            },
        }

    def _build_environment(self) -> list[dict[str, str]]:
        """Generate a simple low-poly ground plane with grid subdivisions."""
        import bpy

        env_cfg = self.gen_cfg.get("environment", {})
        grid_size = env_cfg.get("grid_size", 10)

        bpy.ops.mesh.primitive_plane_add(size=grid_size * 2, location=(0, 0, 0))
        obj = bpy.context.active_object
        obj.name = "Ground"

        # Subdivide for low-poly aesthetic
        bpy.ops.object.mode_set(mode="EDIT")
        bpy.ops.mesh.subdivide(number_cuts=grid_size)
        bpy.ops.object.mode_set(mode="OBJECT")

        return [{"name": obj.name, "type": "environment"}]

    def _build_character_placeholder(self) -> list[dict[str, str]]:
        """Create a placeholder character primitive (to be expanded later)."""
        import bpy

        char_cfg = self.gen_cfg.get("character", {})
        max_verts = char_cfg.get("max_vertices", 5000)

        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=16, ring_count=8, radius=0.5, location=(0, 0, 1)
        )
        obj = bpy.context.active_object
        obj.name = "Character_Placeholder"

        return [{"name": obj.name, "type": "character", "max_vertices": max_verts}]

    def _setup_lighting(self) -> list[dict[str, str]]:
        """Set up three-point studio lighting for stylized renders."""
        import bpy

        lights = []
        positions = [
            ("KeyLight", (3, -3, 5), 100),
            ("FillLight", (-3, -2, 3), 40),
            ("RimLight", (0, 3, 4), 60),
        ]

        for name, loc, energy in positions:
            bpy.ops.object.light_add(type="AREA", location=loc)
            light_obj = bpy.context.active_object
            light_obj.name = name
            light_obj.data.energy = energy
            light_obj.data.size = 2.0
            light_obj.rotation_euler = (math.radians(45), 0, 0)
            lights.append({"name": name, "type": "light"})

        return lights

    def _setup_camera(self) -> dict[str, Any]:
        """Configure camera from pipeline config."""
        import bpy

        cam_cfg = self.config.get("camera", {})

        bpy.ops.object.camera_add(location=(0, -6, 3))
        cam_obj = bpy.context.active_object
        cam_obj.name = "MainCamera"
        bpy.context.scene.camera = cam_obj

        cam_data = cam_obj.data
        cam_data.lens = cam_cfg.get("focal_length", 50)
        cam_data.sensor_width = cam_cfg.get("sensor_width", 36)
        cam_data.clip_start = cam_cfg.get("clip_start", 0.1)
        cam_data.clip_end = cam_cfg.get("clip_end", 1000)

        # Point camera at scene center
        constraint = cam_obj.constraints.new(type="TRACK_TO")
        constraint.target = bpy.data.objects.get("Character_Placeholder")
        constraint.track_axis = "TRACK_NEGATIVE_Z"
        constraint.up_axis = "UP_Y"

        return {"name": cam_obj.name, "focal_length": cam_data.lens}