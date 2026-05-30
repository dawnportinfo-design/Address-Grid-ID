#pragma once

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
