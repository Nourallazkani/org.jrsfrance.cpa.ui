import fs from 'fs'
import s3 from 'gulp-s3-upload';
import gulp from 'gulp';
import {CLIOptions} from 'aurelia-cli';

export default function deploy(done) {
    var awsCredentials = JSON.parse(fs.readFileSync('./awscredentials.json'))

    var toUpload = ["./index.html", "./scripts/**/**", "./assets/**/**"];

    var uploader = s3(awsCredentials);
    let uploaderOptions = { maxRetries: 5, region: "eu-west-1" };
    if (CLIOptions.instance.args.includes('--target')) {
        let target = CLIOptions.instance.args[CLIOptions.instance.args.indexOf("--target") + 1];
        console.log(`deploy ${toUpload.join(', ')} to ${target}`)
        gulp.src(toUpload, { base: './' })
            .pipe(uploader({ Bucket: target, ACL: 'public-read' }, uploaderOptions))
            .on('end', () => done());
    }
    else {
        console.log(`deploy ${toUpload.join(', ')} to www2.comprendrepourapprendre.org`)
        gulp.src(toUpload, { base: './' })
            .pipe(uploader({ Bucket: 'www2.comprendrepourapprendre.org', ACL: 'public-read' }, uploaderOptions))
            .on('end', () => {
                console.log(`deploy ${toUpload.join(', ')} to www2.cpafrance.fr`)
                gulp.src(toUpload, { base: './' })
                    .pipe(uploader({ Bucket: 'www2.cpafrance.fr', ACL: 'public-read' }, uploaderOptions))
                    .on('end', () => {
                        console.log("done");
                        done()
                    })
            });
    }
}