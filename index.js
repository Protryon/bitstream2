

module.exports = raw => {
    return {
        raw: raw,
        _bitIndex: 0,
        read: function(ct) {
            if (this._bitIndex + ct > this.raw.length * 8) {
                return null;
            }
            let baseIndex = (this._bitIndex / 8) | 0;
            let bytes = this.raw.slice(baseIndex, Math.ceil((this._bitIndex + ct) / 8));
            let value = 0;
            let bitOffset = this._bitIndex % 8;
            let bitMask = 0;
            for (let i = bitOffset; i < Math.min(bitOffset + ct, 8); ++i) {
                bitMask |= 1 << (7 - i);
            }
            value = (bytes[0] & bitMask) >>> Math.max(0, (8 - ct) - bitOffset);
            for (let i = 1; i < bytes.length - 1; ++i) {
                value <<= 8;
                value |= bytes[i];
            }
            if (bytes.length > 1) {
                let remainingBits = ct - (8 - (this._bitIndex % 8)) - Math.max(0, bytes.length - 2) * 8;
                let bitTrailOffset = remainingBits;
                value <<= bitTrailOffset;
                bitMask = 0;
                for (let i = 0; i < bitTrailOffset; ++i) {
                    bitMask |= 1 << (7 - i);
                }
                value |= (bytes[bytes.length - 1] & bitMask) >>> (8 - bitTrailOffset);
            }
            this._bitIndex += ct;
            return value;
        },
        write: function(ct, value) {
            let bitMask = 0;
            for (let i = 0; i < ct; ++i) {
                bitMask |= 0x01 << i;
            }
            let toWrite = value & bitMask;
            let bitOffset = this._bitIndex % 8;
            let byteOffset = (this._bitIndex / 8) | 0;
            const rsh = (a1, a2) => a2 >= 0 ? a1 >>> a2 : a1 << -a2;
            // clear
            this.raw[byteOffset] &= ~rsh(bitMask, (ct - (8 - bitOffset))) & 0xFF;
            this.raw[byteOffset] |= rsh(toWrite, (ct - (8 - bitOffset))) & 0xFF;
            let octetCount = Math.floor((ct - (8 - bitOffset)) / 8);
            const modifiedBitOffset = (ct - (8 - bitOffset)) % 8;
            for (let i = byteOffset + octetCount; i >= byteOffset + 1; --i) {
                this.raw[i] = rsh(toWrite, modifiedBitOffset + (8 * (i - byteOffset - octetCount))) & 0xFF;
            }
            if (modifiedBitOffset > 0) {
                this.raw[byteOffset + octetCount + 1] &= ~(bitMask << (8 - modifiedBitOffset)) & 0xFF;
                this.raw[byteOffset + octetCount + 1] |= (toWrite << (8 - modifiedBitOffset)) & 0xFF;
            }
            this._bitIndex += ct;
        },
        seek: function(ct) {
            this._bitIndex += ct;
            if (this._bitIndex < 0) {
                this._bitIndex = 0;
            } else if (this._bitIndex > this.raw.length * 8) {
                this._bitIndex = this.raw.length * 8;
            }
        },
        index: function() {
            return this._bitIndex;
        }
    }
};
