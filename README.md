# bitstream2

An unaligned read/write/seek bitstream for use in various non-octet based encoding/decoding operations.

## Usage

`$ npm i bitstream2`
```
const bitstream = require('bitstream2');
const myStream = bitstream([]);
myStream.write(4, 10); // write 10 as a 4 bit integer
myStream.seek(-4);
myStream.read(4); // returns 10
console.log(myStream.raw[0]); // prints 0x160 (10 << 4)
console.log(myStream.index()); // returns bit level index in stream
```
## API

### Constructor

The `bitstream` constructor takes a mutable reference to some array of integers, or empty, and returns a bitstream object. The initial index is always 0.

### write(ct, value)

`write` takes two arguments, `ct` and `value`. `ct` is the number of bits to write at the stream index, and `value` is some integer to write between 0 and `(1 << ct) - 1` inclusive. It advances the stream index by `ct` bits.

### read(ct)

`read` rakes one argument, `ct`. `ct` is the number of bits to read from the stream index. The return value is the integer read from the stream at the stream index to the stream index + `ct`. It advances the stream index by `ct` bits.

### seek(ct)

`seek` takes one argument, `ct`. The stream index is advanced by `ct` bits.

### index()

`index` takes no arguments and returns the stream index.

### raw

`raw` is a reference to the mutable array that was passed into the bitstream constructor, available for convenience. It should not be modified directly while the bitstream is in use.
