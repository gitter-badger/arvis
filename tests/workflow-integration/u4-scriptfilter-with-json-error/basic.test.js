const Application = require('spectron').Application;
const assert = require('assert');
const electronPath = require('electron');
const loudRejection = require('loud-rejection');
const robot = require('robotjs');
const path = require('path');
const fse = require('fs-extra');
const pathExists = require('path-exists');
const setting = require('../../setting.json');
const { sleep } = require('../../utils');
const { app } = require('../../global');

describe('Integration test', function () {
  this.timeout(setting.timeout);

  it('Test u4 - scriptfilter with json error', async function () {
    await app.client.waitUntilWindowLoaded();
    await app.client.switchWindow('searchWindow');

    const { key, modifier } = setting.toggle_search_window_hotkey;
    robot.keyTap(key, modifier);

    await sleep(500);
 
    robot.keyTap('u');
    robot.keyTap('4');

    await sleep(1000);

    const itemTitle = await (await app.client.$('#searchResultItemTitle-0')).getText();

    assert.strictEqual(itemTitle.includes('Error'), true);
  });
});