# AddressQL TypeScript SDK v0.4

Local-first SDK for AddressQL country, postal, normalization, matching,
distance, and delivery decision support.

```ts
import { postalValidate, deliveryAvailable } from "@addressql/sdk";

postalValidate("1000001", "JP");
deliveryAvailable("JP", "1000001", "synthetic_carrier");
```

This package uses synthetic fixtures only.  It does not call hosted APIs and it
does not prove residence, identity, or carrier SLA.
