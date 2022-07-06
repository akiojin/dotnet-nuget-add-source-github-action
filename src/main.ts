import * as core from '@actions/core'
import * as exec from '@actions/exec'
import { ArgumentBuilder } from '@akiojin/argument-builder'
import { BooleanStateCache, StringStateCache } from './StateHelper'

const IsPostProcess = new BooleanStateCache('IS_POST_PROCESS')
const PackageNameCache = new StringStateCache('PACKAGE_NAME')

class DotNet
{
	static async ListSource(): Promise<string[]>
	{
		const builder = new ArgumentBuilder()
			.Append('nuget')
			.Append('list')
			.Append('source')
			.Append('--format', 'short')

		let output = ''
		const options: exec.ExecOptions = {}
		options.listeners = {
			stdout: (data: Buffer) => {
				output += data.toString()
			}
		}

		try {
			await exec.exec('dotnet', builder.Build(), options)
		} catch (ex: any) {
			return []
		}

		let sources: string[] = []

		if (output !== '') {
			const reg = /^E[ ](.*)$/gm
			let match

			while ((match = reg.exec(output)) !== null) {
				sources.push(match[1])
			}
		}

		return sources;
	}

	static AddSource(name: string, source: string, username: string, password: string): Promise<number>
	{
		const builder = new ArgumentBuilder()
			.Append('nuget')
			.Append('add')
			.Append('source')
			.Append('--username', username)
			.Append('--password', password)
			.Append('--store-password-in-clear-text')
			.Append('--name', `"${name}"`)
			.Append(source)

		return exec.exec('dotnet', builder.Build())
	}

	static RemoveSource(name: string): Promise<number>
	{
		const builder = new ArgumentBuilder()
			.Append('nuget')
			.Append('remove')
			.Append('source', `"${name}"`)

		return exec.exec('dotnet', builder.Build())
	}

	static Build(output: string, configuration: string): Promise<number>
	{
		const builder = new ArgumentBuilder()
			.Append('build')
			.Append('--configuration', configuration)
			.Append('--output', output)

		return exec.exec('dotnet', builder.Build())
	}

	static Publish(output: string, source: string, apiKey: string): Promise<number>
	{
		const builder = new ArgumentBuilder()
			.Append('nuget', 'push')
			.Append(`${output}/*.nupkg`)
			.Append('--source', `"${source}"`)
			.Append('--api-key', apiKey)

		return exec.exec('dotnet', builder.Build())
	}
}

async function Run(): Promise<void> 
{
	try {
		const name = core.getInput('name')
		const sources = await DotNet.ListSource()

		core.info(`Sources(${sources.length}):`)
		sources.forEach(x => {
			core.info(x)
		})

		if (sources.indexOf(name) !== -1) {
			core.info('Already registered.')
		} else {
			await DotNet.AddSource(name, core.getInput('source'), core.getInput('username'), core.getInput('password'))
		}

		PackageNameCache.Set(name)
	} catch (ex: any) {
		core.setFailed(ex.message);
	}
}

async function Cleanup()
{
	try {
		const name = PackageNameCache.Get()

		if (name !== '') {
			core.info(`Cleanup package "${name}"`)
			await DotNet.RemoveSource(name)
		}
	} catch (ex: any) {
		core.setFailed(ex.message)
	}
}

if (!!IsPostProcess.Get()) {
	Cleanup()
} else {
	Run()
}

IsPostProcess.Set(true)
