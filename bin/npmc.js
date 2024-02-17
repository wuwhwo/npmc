#! node

import {readFile} from 'fs/promises'
import {exec} from 'child_process'

const packagePath = process.argv[2]

if (!packagePath) {
	console.log('Error: 需要包路径')
	process.exit(1)
}

const packageInfo = await readFile(packagePath + '/package.json')
	.then(res => {
		return JSON.parse(res.toString())
	})
	.catch(err => {
		console.error(`读取包信息时发生了错误:`, err.message)
		process.exit(1)
	})

const packedFilepath = `${process.cwd()}/${packageInfo.name}-${packageInfo.version}.tgz`

const pwshCommand = `powershell Try{npm pack file:///${process.cwd()}/${packagePath}; npm install file:///${packedFilepath}; rm ${packedFilepath}}Catch{Write-Error $_}`

exec(pwshCommand, (error, stdout, stderr) => {
	if (error) {
		console.error(stderr, '\nError', error)
		process.exit(1)
	}
	console.info(`Packaged ${packageInfo.name} at ./${stdout}\nRemoved ./${packageInfo.name}-${packageInfo.version}.tgz`)
})
