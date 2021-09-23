import { log } from 'boot'
import execa from 'execa'

export const runYarn = async (
  args: string | any[] = '',
  opt?: { npx?: boolean; cwd?: string }
) => {
  log('boot', 'Running NPM...')

  const run = execa(
    opt && opt.npx ? 'npx' : 'npm',
    typeof args === 'string' ? args.split(' ') : args,
    {
      all: true,
      stdout: 'inherit',
      cwd: opt ? opt.cwd : undefined,
      env: { FORCE_COLOR: 'true' },
    }
  )

  run.all.pipe(process.stdout)
  await run
  log('boot', 'NPM Done')
}
