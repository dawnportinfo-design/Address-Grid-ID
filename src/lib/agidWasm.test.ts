import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { combineWasmU32Pair } from './agidWasm';

describe('combineWasmU32Pair', () => {
  it('treats signed i32 wasm results as unsigned 32-bit words', () => {
    assert.equal(combineWasmU32Pair(0, -1), 0xffff_ffffn);
    assert.equal(combineWasmU32Pair(-1, -1), 0xffff_ffff_ffff_ffffn);
    assert.equal(combineWasmU32Pair(-2, 1), 0xffff_fffe_0000_0001n);
  });
});
