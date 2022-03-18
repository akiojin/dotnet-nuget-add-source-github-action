import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as coreCommand from '@actions/core/lib/command'
import { ArgumentBuilder } from '@akiojin/argument-builder'

const IsPost = !!process.env['STATE_POST']

function AllowPostProcess()
{
	coreCommand.issueCommand('save-state', { name: 'POST' }, 'true')
}

async function Run(): Promise<void> 
{
	core.notice('Run')

	try {
		const name = core.getInput('name')
		coreCommand.issueCommand('save-state', { name: 'NAME' }, name)

		const builder = new ArgumentBuilder()
		builder.Append('nuget')
		builder.Append('add', 'source')
		builder.Append('--username', core.getInput('username'))
		builder.Append('--password', core.getInput('password'))
		builder.Append('--store-password-in-clear-text')
		builder.Append('--name', `"${name}"`)
		builder.Append(core.getInput('source'))

		await exec.exec('dotnet', builder.Build())
	} catch (ex: any) {
		core.setFailed(ex.message);
	}
}

async function Cleanup()
{
	core.notice('Cleanup')

	try {
		const name = process.env['STATE_NAME'] || '';

		const builder = new ArgumentBuilder()
		builder.Append('nuget')
		builder.Append('remove', 'source')
		builder.Append('source', `"${name}"`)

		await exec.exec('dotnet', builder.Build())
	} catch (ex: any) {
		core.setFailed(ex.message)
	}
}

if (!!IsPost) {
	Cleanup()
} else {
	Run()
}

AllowPostProcess()
