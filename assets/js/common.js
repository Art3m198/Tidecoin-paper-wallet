function hexToBytes(hex) {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}

function hexStringToUint8Array(hexString)
{
    if (hexString.length % 2 != 0)
        throw "Invalid hexString";
    var arrayBuffer = new Uint8Array(hexString.length / 2);

    for (var i = 0; i < hexString.length; i += 2) {
        var byteValue = parseInt(hexString.substr(i, 2), 16);
        if (byteValue == NaN)
            throw "Invalid hexString";
        arrayBuffer[i/2] = byteValue;
    }

    return arrayBuffer;
}
function bytesToHexString(bytes)
{
    if (!bytes)
        return null;

    bytes = new Uint8Array(bytes);
    var hexBytes = [];

    for (var i = 0; i < bytes.length; ++i) {
        var byteString = bytes[i].toString(16);
        if (byteString.length < 2)
            byteString = "0" + byteString;
        hexBytes.push(byteString);
    }

    return hexBytes.join("");
}
function asciiToUint8Array(str)
{
    var chars = [];
    for (var i = 0; i < str.length; ++i)
        chars.push(str.charCodeAt(i));
    return new Uint8Array(chars);
}
function bytesToASCIIString(bytes)
{
    return String.fromCharCode.apply(null, new Uint8Array(bytes));
}
function failAndLog(error)
{
    console.log(error);
}

const btcTable = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function b58ToBi(chars, table = btcTable) {
  const carry = BigInt(table.length);
  let total = 0n, base = 1n;
  for (let i = chars.length - 1; i >= 0; i--) {
    const n = table.indexOf(chars[i]);
    if (n < 0) throw TypeError(`invalid letter contained: '${chars[i]}'`);
    total += base * BigInt(n);
    base *= carry;
  }
  return total;
}
function biToB58(num, table = btcTable) {
  const carry = BigInt(table.length);
  let r = [];
  while (num > 0n) {
    r.unshift(table[num % carry]);
    num /= carry;
  }
  return r;
}

function b58decode(str, table = btcTable) {
  const chars = [...str];
  const trails = chars.findIndex(c => c !== table[0]);
  const head0s = Array(trails).fill(0);
  if (trails === chars.length) return Uint8Array.from(head0s);
  const beBytes = [];
  let num = b58ToBi(chars.slice(trails), table);
  while (num > 0n) {
    beBytes.unshift(Number(num % 256n));
    num /= 256n;
  }
  return Uint8Array.from(head0s.concat(beBytes));
}

function b58encode(beBytes, table = btcTable) {
  if (!(beBytes instanceof Uint8Array)) throw TypeError(`must be Uint8Array`);
  const trails = beBytes.findIndex(n => n !== 0);
  const head0s = table[0].repeat(trails);
  if (trails === beBytes.length) return head0s;
  const num = beBytes.slice(trails).reduce((r, n) => r * 256n + BigInt(n), 0n);
  return head0s + biToB58(num, table).join("");
}


async function toBase58Check(bytes, prefix = 0, table = btcTable) {
  if (!(bytes instanceof Uint8Array)) throw TypeError(`bytes must be Uint8Array`);
  if (!(0 <= prefix && prefix < 256)) throw TypeError(`prefix must be 0-255`);
  const beBytes = new Uint8Array(5 + bytes.length);
  beBytes[0] = prefix;
  beBytes.set(bytes, 1);
  const view = beBytes.subarray(0, beBytes.length - 4);
  const hashBuffer = await crypto.subtle.digest('SHA-256', view);
  const hash = new Uint8Array(hashBuffer);
  const dhashBuffer = await crypto.subtle.digest('SHA-256', hash);
  const dhash = new Uint8Array(dhashBuffer);
  beBytes.set(dhash.subarray(0, 4), beBytes.length - 4);
  return b58encode(beBytes, table);
}

async function fromBase58Check(str, table = btcTable) {
  const beBytes = b58decode(str, table);
  const view = beBytes.subarray(0, beBytes.length - 4);
  const check = beBytes.subarray(beBytes.length - 4);
  const hashBuffer = await crypto.subtle.digest('SHA-256', view);
  const hash = new Uint8Array(hashBuffer);
  const dhashBuffer = await crypto.subtle.digest('SHA-256', hash);
  const dhash = new Uint8Array(dhashBuffer);
  if (check.some((b, i) => b !== dhash[i])) throw TypeError("invalid check");
  const prefix = view[0], bytes = view.slice(1);
  return [bytes, prefix];
}

function concat(arrays) {
  // sum of individual array lengths
  let totalLength = arrays.reduce((acc, value) => acc + value.length, 0);

  if (!arrays.length) return null;

   let result = new Uint8Array(totalLength);

      // for each array - copy it over result
      // next array is copied right after the previous one
      let length = 0;
      for(let array of arrays) {
            result.set(array, length);
            length += array.length;
      }

      return result;
}