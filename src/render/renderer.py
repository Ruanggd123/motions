"""
Renderer - Configures Blender render settings and executes output.
Supports full video render and single-frame preview modes.
"""
from __future__ import annotations

from pathlib import Path
from typing import Any


class Renderer:
    """Configures and executes Blender renders based on pipeline config."""

    def __init__(self, config: dict[str, Any]) -> None:
        self.config = config
        self.render_cfg = config.get("render", {})
        self.paths_cfg = config.get("paths", {})
        self._output_path: str | None = None

    def set_output_path(self, path: str) -> None:
        """Override the default output directory."""
        self._output_path = path

    def _get_output_dir(self) -> Path:
        if self._output_path:
            return Path(self._output_path)
        return Path(self.paths_cfg.get("output", "./output"))

    def _configure_render_settings(self) -> None:
        """Apply render engine, resolution, codec and quality settings."""
        import bpy

        scene = bpy.context.scene
        rc = self.render_cfg

        # Engine
        engine = rc.get("engine", "BLENDER_EEVEE")
        scene.render.engine = engine

        # Resolution
        scene.render.resolution_x = rc.get("resolution_x", 1080)
        scene.render.resolution_y = rc.get("resolution_y", 1920)
        scene.render.resolution_percentage = 100

        # Samples
        if engine == "CYCLES":
            scene.cycles.samples = rc.get("samples", 128)
        else:
            scene.eevee.taa_render_samples = rc.get("samples", 64)

        # Output format
        scene.render.image_settings.file_format = rc.get("output_format", "FFMPEG")
        scene.render.ffmpeg.format = "MPEG4"
        scene.render.ffmpeg.codec = rc.get("codec", "H264")
        scene.render.ffmpeg.constant_rate_factor = rc.get("quality", "HIGH")

        # Motion blur
        scene.render.use_motion_blur = rc.get("motion_blur", False)

        # Color management for stylized look
        scene.view_settings.look = "High Contrast"
        scene.sequencer_colorspace_settings.name = "sRGB"

    def render_preview(self, scene_name: str) -> None:
        """Render a single frame preview at frame 1."""
        import bpy

        self._configure_render_settings()
        output_dir = self._get_output_dir()
        output_dir.mkdir(parents=True, exist_ok=True)

        preview_path = output_dir / f"{scene_name}_preview.png"
        scene = bpy.context.scene
        scene.frame_set(1)
        scene.render.filepath = str(preview_path)
        scene.render.image_settings.file_format = "PNG"
        bpy.ops.render.render(write_still=True)

        print(f"[Renderer] Preview saved: {preview_path}")

    def render_full(self, scene_name: str) -> None:
        """Render the full animation as video."""
        import bpy

        self._configure_render_settings()
        output_dir = self._get_output_dir()
        output_dir.mkdir(parents=True, exist_ok=True)

        video_path = output_dir / f"{scene_name}.mp4"
        scene = bpy.context.scene
        scene.render.filepath = str(video_path)
        scene.render.image_settings.file_format = "FFMPEG"

        bpy.ops.render.render(animation=True)

        print(f"[Renderer] Video saved: {video_path}")