/*
*   Thanks to icaliman for aws signer 
*   you can download aws signer from https://github.com/icaliman/parse-aws-sign
*/

var image = request.object.get('image');//base 64 encoded image
Parse.Cloud.run('awsUpload', { image: image }, {
    success: function(resp) {
      console.log('aws success url'+resp);
      request.object.set("snappImageUrl" ,resp);//save image to object
      response.success();
    },
    error: function(error) {
      console.log('aws error'+error);
      response.success();
    }
});

//========== Cloud Function For amazon S3 Upload =================//
  Parse.Cloud.define("awsUpload", function(request, response) {
      var Buffer = require('buffer').Buffer;
      var AwsSign = require('cloud/modules/aws-sign.js');//include aws signer in modules folder
      var signer = new AwsSign({
          accessKeyId: 'AWS ACCESS KEY',
          secretAccessKey: 'AWS SECRET ACCESS KEY'
      });
      buf = new Buffer(request.params.image,'base64');
      var d = new Date();
      var imageName = 'IMG_'+d.getFullYear()+d.getMonth()+d.getDate()+'_'+d.getHours()+d.getMinutes()+d.getSeconds();
      var imageUrl = "https://BUCKETNAME.s3.amazonaws.com/FOLDERNAME/"+imageName;
      Parse.Cloud.httpRequest(signer.sign({
          method: 'PUT',
          url: imageUrl,
          headers: { 
            'x-amz-acl': 'public-read',
            'Content-Type':'image'
          },
           // Other request options, ignored by AwsSign.
          body: buf,
          success: function(httpResponse) {
            //console.log('uploaded'+JSON.stringify(httpResponse));  
            console.log('uploaded url'+imageUrl); 
            response.success(imageUrl); 
          },
          error: function(httpResponse) {
            console.error('Request failed for upload code ' + JSON.stringify(httpResponse));
            response.error('Request failed for upload code ' + JSON.stringify(httpResponse));
          }
      }));
  });  
//========== Cloud Function For amazon S3 Upload =================//