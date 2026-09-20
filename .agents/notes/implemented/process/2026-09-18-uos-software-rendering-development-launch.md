# Agent Note: Opt-in UOS software-rendering development launch

Status: implemented

English | [中文](2026-09-18-uos-software-rendering-development-launch.zh.md)

## Problem

Electron 44 crashes during startup on a qualified UOS ARM64 host after its vendor VA-API video driver initializes. The host provides VA-API 1.14, while this Electron generation expects a newer API. Replacing the distribution's `libva` can break the vendor graphics stack, and applying the workaround to every Linux developer would unnecessarily remove hardware acceleration from compatible hosts.

## Decision

Desktop development exposes `dev:desktop:uos` and `start:desktop:uos` as explicit Linux-only launch commands. They set `LIBVA_DRIVER_NAME=disabled` on the development process tree, select X11 and GTK 3 for Electron, disable GPU composition and accelerated video encoding and decoding, and disable the relevant VA-API Chromium features. The ordinary development commands retain Electron's defaults.

The compatibility mode changes neither Chromium sandbox flags nor the dsh command sandbox. It affects development launches only; Linux packaging and release support remain outside this decision.

## Alternatives considered

**Apply software rendering to every Linux launch.** Compatible Linux hosts would lose GPU and video acceleration without need, and a host-specific driver defect would become a product default.

**Replace or upgrade UOS `libva`.** The distribution couples that library to its vendor driver stack. Replacing it can destabilize the desktop outside this application.

**Disable Chromium sandboxing.** The crash occurs during graphics-driver initialization, and the verified graphics switches avoid it. Weakening process isolation does not address the cause.

**Downgrade Electron.** An older Electron can avoid the newer VA-API expectation but also gives up current runtime and security updates. The process-local workaround retains the repository's selected Electron generation.

## Consequences

The UOS commands use software rendering and software video codecs, so WebGL, animation, and video workloads can run more slowly. X11 and GTK 3 are fixed for this mode even when another Linux session supports newer paths. Developers must opt in; the launcher rejects the mode on non-Linux hosts.

Unit tests pin every injected argument, the process-local VA-API environment field, default-command neutrality, the Linux host requirement, and the absence of sandbox-disabling switches. Qualification on the affected UOS ARM64 host verifies window startup with its vendor driver installed.
