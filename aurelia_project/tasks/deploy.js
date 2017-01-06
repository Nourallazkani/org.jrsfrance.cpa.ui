import fs from 'fs'
import s3 from 'gulp-s3-upload';
import gulp from 'gulp';
import {CLIOptions} from 'aurelia-cli';

export default function deploy(done) {
    var awsCredentials = JSON.parse(fs.readFileSync('./awscredentials.json'))

    var toUpload = ["./index.html", "./scripts/**/**", "./assets/**/**"];
    
    let target;
    if (CLIOptions.instance.args.includes('--target')) {
        target = CLIOptions.instance.args[CLIOptions.instance.args.indexOf("--target") + 1];
    }
    else{
        target = "jrs-cpa.templates";
    }
    console.log(`deploy ${toUpload.join(', ')} to ${target}`)
    var uploader = s3(awsCredentials);

    gulp.src(toUpload, { base: './' })
        .pipe(uploader({ Bucket: target, ACL: 'public-read' }, { maxRetries: 5, region: "eu-west-1" }))
        .on('end', () => done());
}