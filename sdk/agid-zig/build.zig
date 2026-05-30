const std = @import("std");

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});
    _ = b.addModule("agid", .{
        .root_source_file = b.path("src/agid.zig"),
        .target = target,
        .optimize = optimize,
    });
}
