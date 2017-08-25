`use strict`;
// 欢迎语
process.stdout.write(`WELCOME TO USE ME! ^_^\r\n`);

// 加载所需模块
const fs = require(`fs`);
const mongo = require(`mongodb`);

// 同步读取输入
const readSyn = (str) => {
	process.stdout.write(str);
	process.stdin.pause();
	const buf = Buffer.allocUnsafe(10000);
	const response = fs.readSync(process.stdin.fd, buf, 0, 10000, 0);
	process.stdin.end();
	return buf.toString(`utf8`, 0, response).trim();
}

// 把dom符号去除并转换为对象
const readJSON = pathname => {
	let bin = fs.readFileSync(pathname);
	if (bin[0] === 0xEF && bin[1] === 0xBB && bin[2] === 0xBF) bin = bin.slice(3);
	return JSON.parse(bin.toString(`utf-8`));
}

// 插入数据库
const insertMany = (db, collectionName, data, exitOut) => {
	const collection = db.collection(collectionName);
	collection.insertMany(data, (err, result) => {
		if (err) throw err;
		process.stdout.write(`Inserted ${result.insertedCount} documents to collection ${collectionName}.\r\n`);
		if (exitOut) {
			db.close();
			process.exit()
		};
	});
}

// 写入数据库
const writeDatabase = db => {
	// 读取转换JSON文件
	process.stdout.write(`Reading province.json...\r\n`);
	const province = readJSON(`./province.json`);
	process.stdout.write(`Succeed loading province.json.\r\n`);
	process.stdout.write(`Reading city.json...\r\n`);
	const city = readJSON(`./city.json`);
	process.stdout.write(`Succeed loading city.json.\r\n`);
	process.stdout.write(`Reading county.json...\r\n`);
	const county = readJSON(`./county.json`);
	process.stdout.write(`Succeed loading county.json.\r\n`);

	insertMany(db, `Province`, province);
	insertMany(db, `City`, city);
	insertMany(db, `County`, county, true);
}

// 询问并输入数据库名
const MongoClient = require(`mongodb`).MongoClient;
let database;
const host = readSyn(`Write down your host server(Default: localhost): `) || `localhost`;
const temp = readSyn(`Write down port(Default: 27017): `);
const port = temp && !isNaN(Number(temp)) || 27017;
while (!database) database = readSyn(`Write down your database name: `);
process.stdout.write(`Connecting database...\r\n`);
MongoClient.connect(`mongodb://${host}:${port}/${database}`, (err, db) => {
	if (err) throw err;
	process.stdout.write(`Connected correctly to server.\r\n`);
	writeDatabase(db);
});