import * as core from '@actions/core'
import * as exec from '@actions/exec'
import { ArgumentBuilder } from '@akiojin/argument-builder'
import { BooleanStateCache, StringStateCache } from './StateHelper'

const IsPostProcess = new BooleanStateCache('IS_POST_PROCESS')
const PackageNameCache = new StringStateCache('PACKAGE_NAME')

class DotNet
{
	static async AddSource(name: string, source: string, username: string, password: string): Promise<number>
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

	static async RemoveSource(name: string): Promise<number>
	{
		const builder = new ArgumentBuilder()
			.Append('nuget')
			.Append('remove')
			.Append('source', `"${name}"`)

		return exec.exec('dotnet', builder.Build())
	}

	static async Build(output: string, configuration: string): Promise<number>
	{
		const builder = new ArgumentBuilder()
			.Append('build')
			.Append('--configuration', configuration)
			.Append('--output', output)

		return exec.exec('dotnet', builder.Build())
	}

	static async Publish(output: string, source: string, apiKey: string): Promise<number>
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
		await DotNet.AddSource(name, core.getInput('source'), core.getInput('username'), core.getInput('password'))

		PackageNameCache.Set(name)
	} catch (ex: any) {
		core.setFailed(ex.message);
	}
}

async function Cleanup()
{
	try {
		await DotNet.RemoveSource(PackageNameCache.Get())
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
