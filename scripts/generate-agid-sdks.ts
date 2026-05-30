import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export type AgidSdkTarget = {
  id: string;
  directory: string;
  language: string;
  packageName: string;
};

export const AGID_SDK_TARGETS: AgidSdkTarget[] = [
  { id: 'agid-spec', directory: 'agid-spec', language: 'Spec', packageName: 'agid-spec' },
  { id: 'agid-rs', directory: 'agid-rs', language: 'Rust', packageName: 'agid' },
  { id: 'agid-c', directory: 'agid-c', language: 'C', packageName: 'agid-c' },
  { id: 'agid-cpp', directory: 'agid-cpp', language: 'C++', packageName: 'agid-cpp' },
  { id: 'agid-wasm', directory: 'agid-wasm', language: 'WebAssembly', packageName: '@agid/wasm' },
  { id: 'agid-js-ts', directory: 'agid-js-ts', language: 'JavaScript/TypeScript', packageName: '@agid/agid' },
  { id: 'agid-py', directory: 'agid-py', language: 'Python', packageName: 'agid' },
  { id: 'agid-go', directory: 'agid-go', language: 'Go', packageName: 'github.com/agid/agid-go' },
  { id: 'agid-swift', directory: 'agid-swift', language: 'Swift', packageName: 'AGID' },
  { id: 'agid-kotlin', directory: 'agid-kotlin', language: 'Kotlin', packageName: 'org.agid:agid-kotlin' },
  { id: 'agid-java', directory: 'agid-java', language: 'Java', packageName: 'org.agid:agid' },
  { id: 'agid-php', directory: 'agid-php', language: 'PHP', packageName: 'agid/agid' },
  { id: 'agid-dotnet', directory: 'agid-dotnet', language: 'C#/.NET', packageName: 'Agid' },
  { id: 'agid-ruby', directory: 'agid-ruby', language: 'Ruby', packageName: 'agid' },
  { id: 'agid-dart', directory: 'agid-dart', language: 'Dart', packageName: 'agid' },
  { id: 'agid-r', directory: 'agid-r', language: 'R', packageName: 'agid' },
  { id: 'agid-julia', directory: 'agid-julia', language: 'Julia', packageName: 'AGID' },
  { id: 'agid-elixir', directory: 'agid-elixir', language: 'Elixir', packageName: 'agid' },
  { id: 'agid-lua', directory: 'agid-lua', language: 'Lua', packageName: 'agid' },
  { id: 'agid-zig', directory: 'agid-zig', language: 'Zig', packageName: 'agid' },
  { id: 'agid-nim', directory: 'agid-nim', language: 'Nim', packageName: 'agid' },
];

const spec = {
  name: 'AGID',
  version: '0.1.0',
  precision: {
    projection: 'cubed-sphere-equal-area',
    faceCount: 6,
    faceAxisBits: 21,
    faceAxisDivisions: 2_097_152,
    hashBits: 50,
    packedBitsUsed: 45,
  },
  stringFormat: {
    prefixLength: 2,
    hashLength: 10,
    totalLength: 12,
    base32Alphabet: '0123456789ABCDEFGHJKMNPQRSTVWXYZ',
    landPrefix: 'ISO 3166-1 alpha-2 where available',
    openOceanPrefix: 'letter + number',
    coastalSeaPrefix: 'number + letter',
    otherPrefix: 'number + number',
  },
  api: [
    'encode(latitude, longitude) -> AgidResult',
    'decode(agid) -> AgidDecoded | null',
    'cellBounds(agid) -> bounds',
    'cellPolygon(agid) -> lon/lat polygon',
  ],
  testVectors: [
    { name: 'Tokyo Station', lat: 35.681236, lon: 139.767125 },
    { name: 'Null Island', lat: 0, lon: 0 },
    { name: 'New York City', lat: 40.7128, lon: -74.006 },
  ],
};

type FileMap = Record<string, string>;

function json(value: unknown) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function readme(target: AgidSdkTarget) {
  return `# ${target.id}

${target.language} SDK package scaffold for AGID.

This package is generated from \`agid-spec/agid-spec.json\` so every language binding follows the same coordinate model, ID format, and public API.

## API

- \`encode(latitude, longitude)\`
- \`decode(agid)\`
- \`cellBounds(agid)\`
- \`cellPolygon(agid)\`

## Status

This scaffold is ready for packaging and CI wiring. The canonical implementation is the existing TypeScript/Rust core in this repository; language implementations should use the shared spec and vectors in \`agid-spec\`.
`;
}

function commonFiles(target: AgidSdkTarget): FileMap {
  return {
    'README.md': readme(target),
    'LICENSE': 'MIT\n',
  };
}

function specFiles(): FileMap {
  return {
    'README.md': `# agid-spec

Language-neutral AGID specification and test vectors.

Use \`agid-spec.json\` as the contract for every generated AGID SDK package.
`,
    'agid-spec.json': json(spec),
    'test-vectors.json': json(spec.testVectors),
  };
}

function rustFiles(): FileMap {
  return {
    ...commonFiles(AGID_SDK_TARGETS[1]),
    'Cargo.toml': `[package]
name = "agid"
version = "0.1.0"
edition = "2021"
license = "MIT"
description = "AGID Rust SDK"

[lib]
name = "agid"
path = "src/lib.rs"
crate-type = ["rlib", "staticlib", "cdylib"]
`,
    'src/lib.rs': `pub const BASE32_ALPHABET: &str = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
pub const AGID_PREFIX_LENGTH: usize = 2;
pub const AGID_HASH_LENGTH: usize = 10;
pub const AGID_TOTAL_LENGTH: usize = 12;

#[derive(Debug, Clone, PartialEq)]
pub struct AgidResult {
    pub id: String,
    pub lat: f64,
    pub lon: f64,
}

pub fn encode(_lat: f64, _lon: f64) -> Result<AgidResult, &'static str> {
    Err("wire the generated SDK to the agid-core reference implementation")
}

pub fn decode(_id: &str) -> Option<AgidResult> {
    None
}
`,
  };
}

function cFiles(): FileMap {
  return {
    ...commonFiles(AGID_SDK_TARGETS[2]),
    'include/agid.h': `#ifndef AGID_H
#define AGID_H

#ifdef __cplusplus
extern "C" {
#endif

#define AGID_PREFIX_LENGTH 2
#define AGID_HASH_LENGTH 10
#define AGID_TOTAL_LENGTH 12

typedef struct agid_result {
  char id[AGID_TOTAL_LENGTH + 1];
  double lat;
  double lon;
  int face;
} agid_result;

int agid_encode(double lat, double lon, agid_result* out);
int agid_decode(const char* id, agid_result* out);

#ifdef __cplusplus
}
#endif

#endif
`,
    'src/agid.c': `#include "agid.h"

int agid_encode(double lat, double lon, agid_result* out) {
  (void)lat;
  (void)lon;
  (void)out;
  return -1;
}

int agid_decode(const char* id, agid_result* out) {
  (void)id;
  (void)out;
  return -1;
}
`,
  };
}

function cppFiles(): FileMap {
  return {
    ...commonFiles(AGID_SDK_TARGETS[3]),
    'include/agid.hpp': `#pragma once

#include <optional>
#include <string>

namespace agid {

constexpr int PrefixLength = 2;
constexpr int HashLength = 10;
constexpr int TotalLength = 12;

struct Result {
  std::string id;
  double lat;
  double lon;
  int face;
};

std::optional<Result> encode(double lat, double lon);
std::optional<Result> decode(const std::string& id);

} // namespace agid
`,
    'src/agid.cpp': `#include "agid.hpp"

namespace agid {

std::optional<Result> encode(double lat, double lon) {
  (void)lat;
  (void)lon;
  return std::nullopt;
}

std::optional<Result> decode(const std::string& id) {
  (void)id;
  return std::nullopt;
}

} // namespace agid
`,
  };
}

function wasmFiles(): FileMap {
  return {
    ...commonFiles(AGID_SDK_TARGETS[4]),
    'package.json': json({
      name: '@agid/wasm',
      version: '0.1.0',
      type: 'module',
      files: ['dist', 'agid_core.wasm'],
      exports: { '.': './dist/index.js' },
    }),
    'src/index.ts': `export type AgidWasmExports = {
  agid_get_quantized_face(lat: number, lon: number): number;
  agid_get_quantized_qx(lat: number, lon: number): number;
  agid_get_quantized_qy(lat: number, lon: number): number;
  agid_get_lat(face: number, qx: number, qy: number): number;
  agid_get_lon(face: number, qx: number, qy: number): number;
};

export async function loadAgidWasm(wasmUrl: string | URL): Promise<AgidWasmExports> {
  const response = await fetch(wasmUrl);
  const bytes = await response.arrayBuffer();
  const instance = await WebAssembly.instantiate(bytes, {});
  return instance.instance.exports as unknown as AgidWasmExports;
}
`,
  };
}

function jsTsFiles(): FileMap {
  return {
    ...commonFiles(AGID_SDK_TARGETS[5]),
    'package.json': json({
      name: '@agid/agid',
      version: '0.1.0',
      type: 'module',
      main: './dist/index.js',
      types: './dist/index.d.ts',
      files: ['dist'],
      scripts: { build: 'tsc -p tsconfig.json' },
    }),
    'tsconfig.json': json({
      compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        declaration: true,
        outDir: 'dist',
        strict: true,
        moduleResolution: 'Bundler',
      },
      include: ['src'],
    }),
    'src/index.ts': `export const BASE32_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
export const AGID_PREFIX_LENGTH = 2;
export const AGID_HASH_LENGTH = 10;
export const AGID_TOTAL_LENGTH = 12;

export type AgidResult = {
  id: string;
  lat: number;
  lon: number;
  face?: number;
};

export function encode(_lat: number, _lon: number): AgidResult {
  throw new Error("wire this package to the AGID TypeScript reference implementation");
}

export function decode(_id: string): AgidResult | null {
  return null;
}
`,
  };
}

function pyFiles(): FileMap {
  return {
    ...commonFiles(AGID_SDK_TARGETS[6]),
    'pyproject.toml': `[project]
name = "agid"
version = "0.1.0"
description = "AGID Python SDK"
requires-python = ">=3.9"
license = { text = "MIT" }
`,
    'agid/__init__.py': `BASE32_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
AGID_PREFIX_LENGTH = 2
AGID_HASH_LENGTH = 10
AGID_TOTAL_LENGTH = 12

def encode(lat: float, lon: float):
    raise NotImplementedError("wire this package to the AGID reference implementation")

def decode(agid: str):
    return None
`,
  };
}

function goFiles(): FileMap {
  return {
    ...commonFiles(AGID_SDK_TARGETS[7]),
    'go.mod': `module github.com/agid/agid-go

go 1.22
`,
    'agid.go': `package agid

const Base32Alphabet = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
const PrefixLength = 2
const HashLength = 10
const TotalLength = 12

type Result struct {
	ID   string
	Lat  float64
	Lon  float64
	Face int
}

func Encode(lat float64, lon float64) (Result, error) {
	return Result{}, ErrNotImplemented
}

func Decode(id string) (Result, error) {
	return Result{}, ErrNotImplemented
}
`,
    'errors.go': `package agid

import "errors"

var ErrNotImplemented = errors.New("wire this package to the AGID reference implementation")
`,
  };
}

function swiftFiles(): FileMap {
  return {
    ...commonFiles(AGID_SDK_TARGETS[8]),
    'Package.swift': `// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "AGID",
    products: [.library(name: "AGID", targets: ["AGID"])],
    targets: [.target(name: "AGID")]
)
`,
    'Sources/AGID/AGID.swift': `public let base32Alphabet = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
public let agidPrefixLength = 2
public let agidHashLength = 10
public let agidTotalLength = 12

public struct AGIDResult: Equatable {
    public let id: String
    public let lat: Double
    public let lon: Double
    public let face: Int?
}

public func encode(lat: Double, lon: Double) throws -> AGIDResult {
    throw AGIDError.notImplemented
}

public func decode(_ id: String) -> AGIDResult? {
    nil
}

public enum AGIDError: Error {
    case notImplemented
}
`,
  };
}

function kotlinFiles(): FileMap {
  return {
    ...commonFiles(AGID_SDK_TARGETS[9]),
    'build.gradle.kts': `plugins {
    kotlin("jvm") version "1.9.24"
}

group = "org.agid"
version = "0.1.0"

repositories {
    mavenCentral()
}
`,
    'src/main/kotlin/org/agid/Agid.kt': `package org.agid

const val BASE32_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
const val AGID_PREFIX_LENGTH = 2
const val AGID_HASH_LENGTH = 10
const val AGID_TOTAL_LENGTH = 12

data class AgidResult(
    val id: String,
    val lat: Double,
    val lon: Double,
    val face: Int? = null,
)

fun encode(lat: Double, lon: Double): AgidResult {
    throw NotImplementedError("wire this package to the AGID reference implementation")
}

fun decode(id: String): AgidResult? = null
`,
  };
}

function javaFiles(): FileMap {
  return {
    ...commonFiles(AGID_SDK_TARGETS[10]),
    'pom.xml': `<project xmlns="http://maven.apache.org/POM/4.0.0"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>org.agid</groupId>
  <artifactId>agid</artifactId>
  <version>0.1.0</version>
  <name>AGID Java SDK</name>
  <properties>
    <maven.compiler.source>17</maven.compiler.source>
    <maven.compiler.target>17</maven.compiler.target>
  </properties>
</project>
`,
    'src/main/java/org/agid/Agid.java': `package org.agid;

public final class Agid {
  public static final String BASE32_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  public static final int PREFIX_LENGTH = 2;
  public static final int HASH_LENGTH = 10;
  public static final int TOTAL_LENGTH = 12;

  private Agid() {}

  public static AgidResult encode(double lat, double lon) {
    throw new UnsupportedOperationException("wire this package to the AGID reference implementation");
  }

  public static AgidResult decode(String id) {
    return null;
  }
}
`,
    'src/main/java/org/agid/AgidResult.java': `package org.agid;

public record AgidResult(String id, double lat, double lon, int face) {}
`,
  };
}

function phpFiles(): FileMap {
  return {
    ...commonFiles(AGID_SDK_TARGETS[11]),
    'composer.json': json({
      name: 'agid/agid',
      description: 'AGID PHP SDK',
      license: 'MIT',
      type: 'library',
      autoload: { psr4: { 'Agid\\\\': 'src/' } },
      require: { php: '>=8.1' },
    }),
    'src/Agid.php': `<?php

namespace Agid;

final class Agid
{
    public const BASE32_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
    public const PREFIX_LENGTH = 2;
    public const HASH_LENGTH = 10;
    public const TOTAL_LENGTH = 12;

    public static function encode(float $lat, float $lon): array
    {
        throw new \\RuntimeException('wire this package to the AGID reference implementation');
    }

    public static function decode(string $id): ?array
    {
        return null;
    }
}
`,
  };
}

function dotnetFiles(): FileMap {
  return {
    ...commonFiles(AGID_SDK_TARGETS[12]),
    'Agid.csproj': `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <PackageId>Agid</PackageId>
    <Version>0.1.0</Version>
    <Authors>AGID</Authors>
    <Description>AGID .NET SDK</Description>
    <PackageLicenseExpression>MIT</PackageLicenseExpression>
  </PropertyGroup>
</Project>
`,
    'src/Agid.cs': `namespace Agid;

public static class Agid
{
    public const string Base32Alphabet = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
    public const int PrefixLength = 2;
    public const int HashLength = 10;
    public const int TotalLength = 12;

    public static AgidResult Encode(double lat, double lon)
    {
        throw new NotImplementedException("wire this package to the AGID reference implementation");
    }

    public static AgidResult? Decode(string id)
    {
        return null;
    }
}

public sealed record AgidResult(string Id, double Lat, double Lon, int? Face);
`,
  };
}

function rubyFiles(): FileMap {
  return {
    ...commonFiles(AGID_SDK_TARGETS[13]),
    'agid.gemspec': `Gem::Specification.new do |spec|
  spec.name = "agid"
  spec.version = "0.1.0"
  spec.summary = "AGID Ruby SDK"
  spec.license = "MIT"
  spec.files = Dir["lib/**/*.rb", "README.md", "LICENSE"]
  spec.require_paths = ["lib"]
  spec.required_ruby_version = ">= 3.0"
end
`,
    'lib/agid.rb': `# frozen_string_literal: true

module Agid
  BASE32_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
  PREFIX_LENGTH = 2
  HASH_LENGTH = 10
  TOTAL_LENGTH = 12

  Result = Struct.new(:id, :lat, :lon, :face, keyword_init: true)

  def self.encode(lat, lon)
    raise NotImplementedError, "wire this package to the AGID reference implementation"
  end

  def self.decode(id)
    nil
  end
end
`,
  };
}

function dartFiles(): FileMap {
  return {
    ...commonFiles(AGID_SDK_TARGETS[14]),
    'pubspec.yaml': `name: agid
description: AGID Dart SDK
version: 0.1.0
environment:
  sdk: ">=3.0.0 <4.0.0"
`,
    'lib/agid.dart': `const base32Alphabet = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const agidPrefixLength = 2;
const agidHashLength = 10;
const agidTotalLength = 12;

class AgidResult {
  const AgidResult({required this.id, required this.lat, required this.lon, this.face});

  final String id;
  final double lat;
  final double lon;
  final int? face;
}

AgidResult encode(double lat, double lon) {
  throw UnimplementedError('wire this package to the AGID reference implementation');
}

AgidResult? decode(String id) => null;
`,
  };
}

function rFiles(): FileMap {
  return {
    ...commonFiles(AGID_SDK_TARGETS[15]),
    'DESCRIPTION': `Package: agid
Type: Package
Title: AGID R SDK
Version: 0.1.0
License: MIT
Encoding: UTF-8
Description: Address Grid ID helpers for R.
Roxygen: list(markdown = TRUE)
`,
    'NAMESPACE': `export(agid_encode)
export(agid_decode)
`,
    'R/agid.R': `BASE32_ALPHABET <- "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
AGID_PREFIX_LENGTH <- 2
AGID_HASH_LENGTH <- 10
AGID_TOTAL_LENGTH <- 12

agid_encode <- function(lat, lon) {
  stop("wire this package to the AGID reference implementation")
}

agid_decode <- function(id) {
  NULL
}
`,
  };
}

function juliaFiles(): FileMap {
  return {
    ...commonFiles(AGID_SDK_TARGETS[16]),
    'Project.toml': `name = "AGID"
uuid = "11111111-2222-3333-4444-555555555555"
authors = ["AGID"]
version = "0.1.0"
`,
    'src/AGID.jl': `module AGID

export encode, decode, AGIDResult

const BASE32_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
const PREFIX_LENGTH = 2
const HASH_LENGTH = 10
const TOTAL_LENGTH = 12

struct AGIDResult
    id::String
    lat::Float64
    lon::Float64
    face::Union{Int, Nothing}
end

function encode(lat::Real, lon::Real)
    error("wire this package to the AGID reference implementation")
end

decode(id::AbstractString) = nothing

end
`,
  };
}

function elixirFiles(): FileMap {
  return {
    ...commonFiles(AGID_SDK_TARGETS[17]),
    'mix.exs': `defmodule Agid.MixProject do
  use Mix.Project

  def project do
    [
      app: :agid,
      version: "0.1.0",
      elixir: "~> 1.15",
      description: "AGID Elixir SDK",
      package: [licenses: ["MIT"]]
    ]
  end
end
`,
    'lib/agid.ex': `defmodule Agid do
  @base32_alphabet "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
  @prefix_length 2
  @hash_length 10
  @total_length 12

  def base32_alphabet, do: @base32_alphabet
  def prefix_length, do: @prefix_length
  def hash_length, do: @hash_length
  def total_length, do: @total_length

  def encode(_lat, _lon) do
    {:error, :not_implemented}
  end

  def decode(_id), do: nil
end
`,
  };
}

function luaFiles(): FileMap {
  return {
    ...commonFiles(AGID_SDK_TARGETS[18]),
    'agid.lua': `local agid = {}

agid.BASE32_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
agid.PREFIX_LENGTH = 2
agid.HASH_LENGTH = 10
agid.TOTAL_LENGTH = 12

function agid.encode(lat, lon)
  error("wire this package to the AGID reference implementation")
end

function agid.decode(id)
  return nil
end

return agid
`,
    'agid-0.1.0-1.rockspec': `package = "agid"
version = "0.1.0-1"
source = { url = "git://github.com/agid/agid-lua" }
description = {
  summary = "AGID Lua SDK",
  license = "MIT"
}
build = {
  type = "builtin",
  modules = {
    agid = "agid.lua"
  }
}
`,
  };
}

function zigFiles(): FileMap {
  return {
    ...commonFiles(AGID_SDK_TARGETS[19]),
    'build.zig': `const std = @import("std");

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});
    _ = b.addModule("agid", .{
        .root_source_file = b.path("src/agid.zig"),
        .target = target,
        .optimize = optimize,
    });
}
`,
    'src/agid.zig': `pub const base32_alphabet = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
pub const prefix_length = 2;
pub const hash_length = 10;
pub const total_length = 12;

pub const Result = struct {
    id: [total_length]u8,
    lat: f64,
    lon: f64,
    face: ?u8,
};

pub fn encode(lat: f64, lon: f64) !Result {
    _ = lat;
    _ = lon;
    return error.NotImplemented;
}

pub fn decode(id: []const u8) ?Result {
    _ = id;
    return null;
}
`,
  };
}

function nimFiles(): FileMap {
  return {
    ...commonFiles(AGID_SDK_TARGETS[20]),
    'agid.nimble': `version       = "0.1.0"
author        = "AGID"
description   = "AGID Nim SDK"
license       = "MIT"
srcDir        = "src"
`,
    'src/agid.nim': `const
  base32Alphabet* = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
  prefixLength* = 2
  hashLength* = 10
  totalLength* = 12

type
  AgidResult* = object
    id*: string
    lat*: float
    lon*: float
    face*: int

proc encode*(lat: float, lon: float): AgidResult =
  raise newException(CatchableError, "wire this package to the AGID reference implementation")

proc decode*(id: string): AgidResult =
  raise newException(CatchableError, "not implemented")
`,
  };
}

const FILES_BY_TARGET: Record<string, () => FileMap> = {
  'agid-spec': specFiles,
  'agid-rs': rustFiles,
  'agid-c': cFiles,
  'agid-cpp': cppFiles,
  'agid-wasm': wasmFiles,
  'agid-js-ts': jsTsFiles,
  'agid-py': pyFiles,
  'agid-go': goFiles,
  'agid-swift': swiftFiles,
  'agid-kotlin': kotlinFiles,
  'agid-java': javaFiles,
  'agid-php': phpFiles,
  'agid-dotnet': dotnetFiles,
  'agid-ruby': rubyFiles,
  'agid-dart': dartFiles,
  'agid-r': rFiles,
  'agid-julia': juliaFiles,
  'agid-elixir': elixirFiles,
  'agid-lua': luaFiles,
  'agid-zig': zigFiles,
  'agid-nim': nimFiles,
};

export async function generateAgidSdks(outputDir = path.join(process.cwd(), 'sdk')) {
  const writtenFiles: string[] = [];

  for (const target of AGID_SDK_TARGETS) {
    const files = FILES_BY_TARGET[target.id]();
    const targetDir = path.join(outputDir, target.directory);

    for (const [relativePath, content] of Object.entries(files)) {
      const filePath = path.join(targetDir, relativePath);
      await mkdir(path.dirname(filePath), { recursive: true });
      await writeFile(filePath, content, 'utf8');
      writtenFiles.push(filePath);
    }
  }

  return {
    outputDir,
    targets: AGID_SDK_TARGETS,
    writtenFiles,
  };
}

async function main() {
  const argOutputDir = process.argv[2];
  const outputDir = argOutputDir ? path.resolve(argOutputDir) : path.join(process.cwd(), 'sdk');
  const result = await generateAgidSdks(outputDir);
  console.log(`Generated ${result.targets.length} AGID SDK targets in ${result.outputDir}`);
}

const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === currentFile) {
  main().catch(error => {
    console.error(error);
    process.exit(1);
  });
}
