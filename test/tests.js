const assert = require('assert');
const bitstream = require('../index.js');

describe('bitstream', function() {
    it('can be created from empty array', () => {
        bitstream([]);
    });

    it('can be created from int array', () => {
        bitstream([0x128, 0x01]);
    });

    it('can read sub-octet bits, byte-aligned', () => {
        const bs = bitstream([0b01011010, 0b10100101]);
        assert.equal(bs.read(4), 0b0101);
        assert.equal(bs.read(4), 0b1010);
        assert.equal(bs.read(4), 0b1010);
        assert.equal(bs.read(4), 0b0101);
    });

    it('can read octets, byte-aligned', () => {
        const bs = bitstream([0b01011010, 0b10100101]);
        assert.equal(bs.read(8), 0b01011010);
        assert.equal(bs.read(8), 0b10100101);
    });

    it('can read octets, byte-unaligned', () => {
        const bs = bitstream([0b00000000, 0b01011010, 0b10100101]);
        assert.equal(bs.read(4), 0);
        assert.equal(bs.read(8), 0b00000101);
        assert.equal(bs.read(8), 0b10101010);
        assert.equal(bs.read(4), 0b0101);
    });

    it('cannot overread', () => {
        const bs = bitstream([0b00000000]);
        assert.equal(bs.read(10), null);
    });

    it('can read 16 bit ints, byte-aligned', () => {
        const bs = bitstream([0b01011010, 0b10100101, 0b10100101, 0b01011010]);
        assert.equal(bs.read(16), 0b0101101010100101);
        assert.equal(bs.read(16), 0b1010010101011010);
    });

    it('can read 16 bit ints, byte-unaligned', () => {
        const bs = bitstream([0b00000000, 0b01011010, 0b10100101, 0b10100101, 0b01011010]);
        assert.equal(bs.read(4), 0);
        assert.equal(bs.read(16), 0b0000010110101010);
        assert.equal(bs.read(16), 0b0101101001010101);
        assert.equal(bs.read(4), 0b1010);
    });

    it('can write new data', () => {
        const bs = bitstream([]);
        bs.write(8, 0b01011010);
        assert.equal(bs.raw.length, 1);
        assert.equal(bs.raw[0], 0b01011010);
    });

    it('can append new data', () => {
        const bs = bitstream([0b10100101]);
        bs.seek(8);
        bs.write(8, 0b01011010);
        assert.equal(bs.raw.length, 2);
        assert.equal(bs.raw[0], 0b10100101);
        assert.equal(bs.raw[1], 0b01011010);
    });

    it('can overwrite single octet', () => {
        const bs = bitstream([0b10100101]);
        bs.write(8, 0b01011010);
        assert.equal(bs.raw.length, 1);
        assert.equal(bs.raw[0], 0b01011010);
    });

    it('can overwrite initial nibble', () => {
        const bs = bitstream([0b10100101]);
        bs.write(4, 0b0101);
        assert.equal(bs.raw.length, 1);
        assert.equal(bs.raw[0], 0b01010101);
    });

    it('can overwrite final nibble', () => {
        const bs = bitstream([0b10100101]);
        bs.seek(4);
        bs.write(4, 0b1010);
        assert.equal(bs.raw.length, 1);
        assert.equal(bs.raw[0], 0b10101010);
    });

    it('can overwrite unaligned octet', () => {
        const bs = bitstream([0b01011010, 0b10100101]);
        bs.seek(4);
        bs.write(8, 0b01010101);
        assert.equal(bs.raw.length, 2);
        assert.equal(bs.raw[0], 0b01010101);
        assert.equal(bs.raw[1], 0b01010101);
    });

    it('can overwrite 16-bit aligned', () => {
        const bs = bitstream([0b01011010, 0b10100101]);
        bs.write(16, 0b1010010101011010);
        assert.equal(bs.raw.length, 2);
        assert.equal(bs.raw[0], 0b10100101);
        assert.equal(bs.raw[1], 0b01011010);
    });

    it('can overwrite 16-bit unaligned', () => {
        const bs = bitstream([0b10100101, 0b01011010, 0b10100101]);
        bs.seek(4);
        bs.write(16, 0b1010010101011010);
        assert.equal(bs.raw.length, 3);
        assert.equal(bs.raw[0], 0b10101010);
        assert.equal(bs.raw[1], 0b01010101);
        assert.equal(bs.raw[2], 0b10100101);
    });

    it('can partial append 16-bit overwrite', () => {
        const bs = bitstream([0b01011010]);
        bs.write(16, 0b1010010101011010);
        assert.equal(bs.raw.length, 2);
        assert.equal(bs.raw[0], 0b10100101);
        assert.equal(bs.raw[1], 0b01011010);
    });
});