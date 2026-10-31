"""
Animator - Applies keyframe animations to scene objects and camera.
Handles procedural motion curves, camera paths, and object transformations.
"""
from __future__ import annotations

import math
from typing import Any


class Animator:
    """Applies animation to a built scene based on pipeline config."""

    def __init__(self, config: dict[str, Any]) -> None:
        self.config = config
        self.anim_cfg = config.get("animation", {})
        self.cam_cfg = config.get("camera", {})

    def animate(self, scene_data: dict[str, Any]) -> None:
        """Apply all animations to the scene."""
        import bpy  # noqa: F401

        duration = self.anim_cfg.get("default_duration", 15)
        fps = self.config.get("render", {}).get("fps", 30)
        total_frames = duration * fps

        bpy.context.scene.frame_start = 1
        bpy.context.scene.frame_end = total_frames
        bpy.context.scene.render.fps = fps

        self._animate_camera(total_frames)
        self._animate_objects(scene_data, total_frames)

    def _animate_camera(self, total_frames: int) -> None:
        """Create a smooth orbital camera movement around the scene center."""
        import bpy

        cam_obj = bpy.data.objects.get("MainCamera")
        if cam_obj is None:
            return

        # Orbital path parameters
        radius = 6.0
        height_start = 3.0
        height_end = 2.0
        rotations = 0.75  # partial orbit for visual interest

        # Keyframe start position
        bpy.context.scene.frame_set(1)
        cam_obj.location = (0, -radius, height_start)
        cam_obj.keyframe_insert(data_path="location", frame=1)

        # Keyframe mid position (90 degrees around)
        mid_frame = total_frames // 2
        bpy.context.scene.frame_set(mid_frame)
        angle_mid = math.pi * rotations
        cam_obj.location = (
            radius * math.sin(angle_mid),
            -radius * math.cos(angle_mid),
            (height_start + height_end) / 2,
        )
        cam_obj.keyframe_insert(data_path="location", frame=mid_frame)

        # Keyframe end position
        bpy.context.scene.frame_set(total_frames)
        angle_end = math.pi * 2 * rotations
        cam_obj.location = (
            radius * math.sin(angle_end),
            -radius * math.cos(angle_end),
            height_end,
        )
        cam_obj.keyframe_insert(data_path="location", frame=total_frames)

        # Smooth interpolation
        for fcurve in cam_obj.animation_data.action.fcurves:
            for kp in fcurve.keyframe_points:
                kp.interpolation = "BEZIER"
                kp.handle_left_type = "AUTO"
                kp.handle_right_type = "AUTO"

    def _animate_objects(self, scene_data: dict[str, Any], total_frames: int) -> None:
        """Apply idle/breathing animations to character and environment props."""
        import bpy

        char_obj = bpy.data.objects.get("Character_Placeholder")
        if char_obj is not None:
            # Gentle breathing scale animation
            bpy.context.scene.frame_set(1)
            char_obj.scale = (1.0, 1.0, 1.0)
            char_obj.keyframe_insert(data_path="scale", frame=1)

            breathe_frame = total_frames // 4
            bpy.context.scene.frame_set(breathe_frame)
            char_obj.scale = (1.05, 1.08, 1.05)
            char_obj.keyframe_insert(data_path="scale", frame=breathe_frame)

            bpy.context.scene.frame_set(breathe_frame * 2)
            char_obj.scale = (1.0, 1.0, 1.0)
            char_obj.keyframe_insert(data_path="scale", frame=breathe_frame * 2)

            bpy.context.scene.frame_set(breathe_frame * 3)
            char_obj.scale = (1.05, 1.08, 1.05)
            char_obj.keyframe_insert(data_path="scale", frame=breathe_frame * 3)

            bpy.context.scene.frame_set(total_frames)
            char_obj.scale = (1.0, 1.0, 1.0)
            char_obj.keyframe_insert(data_path="scale", frame=total_frames)

            # Smooth all scale keyframes
            if char_obj.animation_data and char_obj.animation_data.action:
                for fcurve in char_obj.animation_data.action.fcurves:
                    for kp in fcurve.keyframe_points:
                        kp.interpolation = "BEZIER"
                        kp.handle_left_type = "AUTO"
                        kp.handle_right_type = "AUTO"

        # Subtle ground rotation for dynamic feel
        ground_obj = bpy.data.objects.get("Ground")
        if ground_obj is not None:
            bpy.context.scene.frame_set(1)
            ground_obj.rotation_euler = (0, 0, 0)
            ground_obj.keyframe_insert(data_path="rotation_euler", frame=1)

            bpy.context.scene.frame_set(total_frames)
            ground_obj.rotation_euler = (0, 0, math.radians(5))
            ground_obj.keyframe_insert(data_path="rotation_euler", frame=total_frames)