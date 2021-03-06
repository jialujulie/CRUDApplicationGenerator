'use strict';
const { exec } = require('child_process');

module.exports = function (yeoEntity,outputPath) {
    //execute cmd
    var cmd=exec('cd '+outputPath+' && ./gradlew build && ./gradlew bootRun');
    var chalk = require('chalk');

    //show build and run information from gradle in real time
    cmd.stdout.on('data', (data) => {
            process.stdout.write(`${data}`);
        });

    yeoEntity.log(chalk.bold.green("\nStop application by entering 'exit'.\n"));
    var stdin = process.stdin;
    stdin.setEncoding( 'utf8' );
    stdin.setRawMode=true;
    stdin.resume();
    //waiting for input command
    stdin.on( 'data', function( key )
    {
        if(key=='exit\n'){
            //using gradle -stop to stop daemon
            exec('cd '+outputPath+' && ./gradlew -stop',function (error, stdout, stderr) {
                console.log(stdout,stderr);
                process.exit();
            });
        }else{
            yeoEntity.log(chalk.bold.green("Stop application by entering 'exit'."));
        }
    });
}