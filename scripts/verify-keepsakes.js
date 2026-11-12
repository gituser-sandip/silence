const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', 'client', 'public', 'assets', 'keepsakes');
const names = ['pure-citrus', 'reminiscence-rose', 'afterglow-sandalwood', 'soulmate-amber', 'eternal-letter'];
let total = 0;

for (const name of names) {
  const model = fs.readFileSync(path.join(root, `${name}.glb`));
  assert.equal(model.subarray(0, 4).toString(), 'glTF', `${name}.glb is not a valid GLB file`);
  total += model.length;
  assert.ok(fs.existsSync(path.join(root, 'previews', `${name}.webp`)), `${name} has no static fallback preview`);
}

assert.ok(total < 2 * 1024 * 1024, `Keepsake models are too large: ${total} bytes`);
assert.equal(fs.readdirSync(root).some(name => name.endsWith('.blend') || name.endsWith('.blend1')), false, 'Blender source files must not be public assets');
console.log(`Keepsakes passed: ${names.length} GLBs, ${total} bytes total.`);
