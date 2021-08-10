import fetch from 'node-fetch'
import fs from 'fs'

const followersUrl = (name, limit, offset) => { return `https://api.scratch.mit.edu/users/${name}/followers?limit=${limit}&offset=${offset}` }
const followingUrl = (name, limit, offset) => { return `https://api.scratch.mit.edu/users/${name}/following?limit=${limit}&offset=${offset}` }
const MAX_LIMIT = 40;
const STEM_USER = "ilhp10"

let indexMap = {};
let indexList = [];
let lastLen = 0;

async function save() {
    let file = ''
    indexList.forEach(boi => file += boi + '\n');
    fs.writeFileSync('usernames.txt', file, function (err) {
        if (err) return console.log(err);
    });
}

let startTime = new Date();


async function sleep(millis) { return new Promise(res => setTimeout(res, millis)) }


async function getFollowers(name, offset) {
    try {
        return await (await fetch(followersUrl(name, MAX_LIMIT, offset))).json()
    } catch (err) { return [] }
}
async function getFollowing(name, offset) {
    try {
        return await (await fetch(followingUrl(name, MAX_LIMIT, offset))).json()
    } catch (err) { return [] }
}

function report() {
    if (indexList.length != lastLen) {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(indexList.length + " Usernames Collected [" + (new Date() - startTime) / 1000 + " secs]");
        // console.log(indexList.length);
        lastLen = indexList.length;
    }
}

async function getAllFollowingAndDo(name, foEach) {
    let res = []
    for (let i = 0; i += MAX_LIMIT; true) {
        res = await getFollowing(name, i)
        res.forEach(boi => res.push(boi.username))
        res.forEach(boi => foEach(boi.username))
        if (res.length < MAX_LIMIT) {
            break;
        }
    }
    return res;
}
async function getAllFollowersAndDo(name, foEach) {
    let res = []
    for (let i = 0; i += MAX_LIMIT; true) {
        res = await getFollowers(name, i);
        res.forEach(boi => foEach(boi.username))
        res.forEach(boi => res.push(boi.username))
        if (res.length < MAX_LIMIT) {
            break;
        }
    }
    return res;
}

async function doUpon(stem) {
    indexMap[stem] = true;
    indexList.push(stem);
    report();
    getAllFollowingAndDo(stem, (name) => { if (!indexMap[name]) { doUpon(name); } });
    getAllFollowersAndDo(stem, (name) => { if (!indexMap[name]) { doUpon(name); } });
}

doUpon(STEM_USER);

(async () => {
    while (true) {
        report()
        await sleep(1000);
    }
})();

(async () => {
    while (true) {
        await sleep(10000);
        save();
    }
})();