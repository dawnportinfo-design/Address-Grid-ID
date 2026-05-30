module AGID

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
