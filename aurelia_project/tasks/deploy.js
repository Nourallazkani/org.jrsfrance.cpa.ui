import fs from 'fs'
import s3 from 'gulp-s3-upload';
import gulp from 'gulp';
import build from './build';
import {CLIOptions} from 'aurelia-cli';

import aureliaProject from '../aurelia.json';

var awsCredentials = JSON.parse(fs.readFileSync('./awscredentials.json'))

var uploader = s3(awsCredentials);
let uploaderOptions = { maxRetries: 5, region: "eu-west-1" };

let buckets = CLIOptions.hasFlag('destination') ? CLIOptions.getFlagValue("destination").split(",") : ["www2.comprendrepourapprendre.org", "www2.cpafrance.fr"];

var toUpload = [`./${aureliaProject.platform.index}`, `./${aureliaProject.platform.output}/**/**.js`, "./assets/**/**"];

let functions = buckets.map(bucket => function (_done) {
    console.log(`Starting upload of ${toUpload.join(', ')} to ${bucket}...`);
    gulp.src(toUpload, { base: './' })
        .pipe(uploader({ Bucket: bucket, ACL: 'public-read' }, uploaderOptions))
        .on('end', () => {
            console.log(`Finished upload of ${toUpload.join(', ')} to ${bucket}...`);
            _done();
        });
});

if (CLIOptions.getEnvironment() == "dev") {
    throw "cannot deploy dev version, please set environment to stage or prod : --env prod or --env stage";
}
export default gulp.series(build, functions);