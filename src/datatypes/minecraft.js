module.exports={
  'string': [readString, writeString, 64],
  'byte_array': [readByteArray, writeByteArray, sizeOfByteArray]
};

var PartialReadError=require('protodef').utils.PartialReadError;
var tryCatch=require('protodef').utils.tryCatch;
var addErrorField=require('protodef').utils.addErrorField;


function readString(buffer, offset) {
  if(offset+64>buffer.length)
    throw new PartialReadError();
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
  var countResults = this.read(buffer, offset, "i16");

  var results = {
    value: [],
    size: 2
  };

  if(offset+countResults.value>buffer.length)
    throw new PartialReadError();
  var uncompressed=zlib.deflateSync(buffer.slice(offset+2,offset+countResults.value));
  results.size+=1024;

  var off=0;
  for(var i = 0; i < uncompressed.length; i++) {
    var readResults;
    try {
      readResults = this.read(uncompressed, off, "u8");
    }
    catch(e){
      addErrorField(e, i);
      throw e;
    }
    off += readResults.size;
    results.value.push(readResults.value);
  }
  return results;
}

function writeByteArray(value, buffer, offset) {
  offset=this.write(value.length, buffer, 0, "i16");

  var buf=new Buffer(1024);
  var off=0;
  for(var i=0;i<1024;i++)
      off = this.write(i >= value.length ? 0 : value[i], buf, off, "u8");

  var compressed=zlib.deflateSync(buf);
  compressed.copy(buffer,offset);


  return offset+compressed.length;
}

function sizeOfByteArray(value) {

  var buf=new Buffer(1024);
  var off=0;
  for(var i=0;i<1024;i++)
    off = this.write(i >= value.length ? 0 : value[i], buf, off, "i8");

  var compressed=zlib.deflateSync(buf);

  return 2+2+compressed.length;
}