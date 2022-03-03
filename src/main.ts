import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as coreCommand from '@actions/core/lib/command'

const IsPost = !!process.env['STATE_POST']

function AllowPostProcess()
{
	coreCommand.issueCommand('save-state', { name: 'POST' }, 'true')
}

async function Run(): Promise<void> 
{
	core.notice('Run')

	try {
		const username: string = core.getInput('username')
		const password: string = core.getInput('password')
		const name: string = core.getInput('name')
		const source: string = core.getInput('source')

		if (username === '') {
			throw new Error('username is null')
		}
		if (password === '') {
			throw new Error('password is null')
		}
		if (name === '') {
			throw new Error('name is null')
		}
		if (source === '') {
			throw new Error('source is null')
		}

		coreCommand.issueCommand('save-state', { name: 'NAME' }, name)

		const args: string[] = [
			'nuget',
			'add',
			'source',
			'--username', username,
			'--password', password,
			'--store-password-in-clear-text',
			'--name', `"${name}"`, source
		]

		await exec.exec('dotnet', args)
	} catch (ex: any) {
		core.setFailed(ex.message);
	}
}

async function Cleanup()
{
	core.notice('Cleanup')

	try {
		const name: string = process.env['STATE_NAME'] || '';

		if (name === '') {
			throw new Error('NuGet Source is empty.')
		}

		await exec.exec('dotnet', ['nuget', 'remove', 'source', `"${name}"`])
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
