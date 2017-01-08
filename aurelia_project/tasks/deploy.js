import fs from 'fs'
import s3 from 'gulp-s3-upload';
import gulp from 'gulp';
import build from './build';
import {CLIOptions} from 'aurelia-cli';

export default gulp.series(build, deploy);

function deploy(done) {
    var awsCredentials = JSON.parse(fs.readFileSync('./awscredentials.json'))

    var uploader = s3(awsCredentials);
    let uploaderOptions = { maxRetries: 5, region: "eu-west-1" };

    let buckets;
    if (CLIOptions.instance.args.includes('--buckets')) {
        let target = CLIOptions.instance.args[CLIOptions.instance.args.indexOf("--buckets") + 1];
        buckets = target.split(",");
    }
    else {
        buckets = ["www2.comprendrepourapprendre.org", "www2.cpafrance.fr"];
    }

    var toUpload = ["./index.html", "./scripts/**/**.js", "./assets/**/**"];


    let uploadsDone = 0;
    for (let bucket of buckets) {
        console.log(`deploy ${toUpload.join(', ')} to ${bucket}`)
        gulp.src(toUpload, { base: './' })
            .pipe(uploader({ Bucket: bucket, ACL: 'public-read' }, uploaderOptions))
            .on('end', () => {
                console.log(`deploy ${toUpload.join(', ')} to ${bucket} : OK`);
                uploadsDone = uploadsDone + 1;
                if (uploadsDone == buckets.length) {
                    done();
                }
            });
    }
}