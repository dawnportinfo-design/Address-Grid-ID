# @agid/addressql

AddressQL query contracts, the privacy-bounded practical API, database adapter
surfaces, multilingual policy, and client SDK exports.

Country data stays in `@agid/country-data`; AGID geometry stays in
`@agid/core`. AddressQL consumes their versioned public contracts and does not
turn format validation into a delivery guarantee.

The `deliveryPointDecision` export exposes the signed, commitment-only L5
carrier decision contract. L4 delivery-area validation remains available
through `practicalApi` and does not imply an L5 delivery-point result.
