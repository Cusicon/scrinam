const fs = require('fs');
const path = require('path');

class Cache{
    constructor() {
        this.cacheDir = path.join(__dirname, '../../cache.json');
        this.cacheFD = 0;
    }

    retrieveCache(){
        if(fs.existsSync(this.cacheDir)){
            fs.readFile(this.cacheDir, (err, data) => {
                if(err){
                    return {};
                }
                console.log('Cache read!');
                if(data){
                    let test = ((JSON.parse(data)));
                }
            })
        } else {
            fs.open(this.cacheDir, 'a+', (err, fd) => {
                if(err){
                    console.log(err);
                }
                this.cacheFD = fd;
            });
            fs.close(this.cacheFD, ()=>{
                console.log('Cache closed');
            });
        }
    }

    static addLinks(){
        
    }
}
module.exports = Cache;