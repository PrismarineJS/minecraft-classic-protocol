module.exports={
  'string': [readString, writeString, 64],
  'byte_array': [readByteArray, writeByteArray, sizeOfByteArray]
};

var tryCatch=require('protodef').utils.tryCatch;
var addErrorField=require('protodef').utils.addErrorField;


function readString(buffer, offset) {

  var value = buffer.toString('ascii', offset, offset + 64);
  value=value.trim();
  return {
    value: value,
    size: 64
  };
}

function writeString(value, buffer, offset) {
  for(var i=value.length-1;i<64;i++)
    value+=" ";
  buffer.write(value, offset, 64, 'ascii');
  return offset + 64;
}

var zlib = require("zlib");

// TODO: fix this (we only need write currently so I didn't fix it)
function readByteArray(buffer, offset) {
  var countResults = this.read(buffer, offset, "short");

  var results = {
    value: [],
    size: 2
  };

  var uncompressed=zlib.deflateSync(buffer.slice(offset+2,offset+countResults.value));
  results.size+=uncompressed.length;

  var off=0;
  for(var i = 0; i < uncompressed.length; i++) {
    var readResults;
    tryCatch(() => {
      readResults = this.read(uncompressed.length, off, "byte");
    }, (e) => {
      addErrorField(e, i);
      throw e;
    });
    results.size += readResults.size;
    off += readResults.size;
    results.value.push(readResults.value);
  }
  return results;
}

function writeByteArray(value, buffer, offset) {
  offset=this.write(value.length, buffer, 0, "short");

  var buf=new Buffer(1024);
  var off=0;
  for(var i=0;i<1024;i++)
      off = this.write(i >= value.length ? 0 : value[i], buf, off, "byte");

  var compressed=zlib.deflateSync(buf);
  buffer.writeUInt8(0x1f,offset);
  buffer.writeUInt8(0x8b,offset+1);
  compressed.copy(buffer,offset+2);


  return offset+2+compressed.length;
}

function sizeOfByteArray(value) {

  var buf=new Buffer(1024);
  var off=0;
  for(var i=0;i<1024;i++)
    off = this.write(i >= value.length ? 0 : value[i], buf, off, "byte");

  var compressed=zlib.deflateSync(buf);

  return 2+2+compressed.length;
}