#ifndef AGID_H
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
