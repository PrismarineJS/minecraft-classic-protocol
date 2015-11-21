module.exports={
  'string': [readString, writeString, 64],
  'byte_array': [readByteArray, writeByteArray, 1024]
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

function readByteArray(buffer, offset) {
  var results = {
    value: [],
    size: 1024
  };
  var count=1024;
  for(var i = 0; i < count; i++) {
    var readResults;
    tryCatch(() => {
      readResults = this.read(buffer, offset, "byte");
    }, (e) => {
      addErrorField(e, i);
      throw e;
    });
    results.size += readResults.size;
    offset += readResults.size;
    results.value.push(readResults.value);
  }
  return results;
}

function writeByteArray(value, buffer, offset, typeArgs, rootNode) {
    for(var index in value) {
    tryCatch(() => {
      offset = this.write(value[index], buffer, offset, typeArgs.type, rootNode);
    }, (e) => {
      addErrorField(e, index);
      throw e;
    });
  }
  return offset;
}