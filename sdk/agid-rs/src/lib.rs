pub const BASE32_ALPHABET: &str = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
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
