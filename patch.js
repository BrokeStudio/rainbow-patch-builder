const path = require("path");
const fs = require("fs");

const log = require("./log");

module.exports = (oldFile, newFile, patchFile) => {
  // patch file ?
  if (patchFile === undefined) patchFile = "patch.bin";

  // open files
  if (!fs.existsSync(oldFile)) {
    log.error(`File not found: ${oldFile}`);
    return false;
  }
  if (!fs.existsSync(newFile)) {
    log.error(`File not found: ${newFile}`);
    return false;
  }
  const fOld = fs.readFileSync(oldFile);
  const fNew = fs.readFileSync(newFile);

  // parse headers
  if (fOld[0] != 0x4e && fOld[1] != 0x45 && fOld[2] != 53 && fOld[3] != 0x1a) {
    log.error(`${oldFile} is not a valid NES ROM file...`);
    return false;
  }
  if (fNew[0] != 0x4e && fNew[1] != 0x45 && fNew[2] != 53 && fNew[3] != 0x1a) {
    log.error(`${newFile} is not a valid NES ROM file...`);
    return false;
  }

  // PRG-ROM banks
  if (fOld[4] != fNew[4]) {
    log.warning(
      `OLD ROM contains ${fOld[4]} PRG-ROM banks, and the NEW ROM contains ${fNew[4]} PRG-ROM banks...`
    );
    log.warning("NEW ROM will be used as size reference...");
  }

  // CHR-ROM or CHR-RAM ?
  if (fOld[5] == 0 && fNew[5] != 0) {
    log.error("OLD ROM uses CHR-RAM while the NEW one uses CHR-ROM...");
    return false;
  }
  if (fOld[5] != 0 && fNew[5] == 0) {
    log.error("NEW ROM uses CHR-RAM while the OLD one uses CHR-ROM...");
    return false;
  }

  // CHR-ROM banks
  if (fOld[5] != fNew[5]) {
    log.warning(
      `OLD ROM contains ${fOld[5]} CHR-ROM banks, and the NEW ROM contains ${fNew[5]} CHR-ROM banks...`
    );
    log.warning("NEW ROM will be used as size reference...");
  }

  // prepare patch file
  const fPatch = fs.openSync(patchFile, "w+");

  // add patch file header
  fs.writeSync(
    fPatch,
    new Uint8Array([
      "R".charCodeAt(),
      "N".charCodeAt(),
      "B".charCodeAt(),
      "W".charCodeAt(),
      0x1a,
      0, // file version
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
    ])
  );

  // compare files and build patch file
  const PRG_ROM_SIZE = fNew[4] * 16 * 1024;
  const CHR_ROM_SIZE = fNew[5] * 8 * 1024;
  const PRG_SECTORS = PRG_ROM_SIZE / (64 * 1024);
  const CHR_SECTORS = CHR_ROM_SIZE / (64 * 1024);

  log.info(`PRG_SECTORS: ${PRG_SECTORS}`);
  log.info(`CHR_SECTORS: ${CHR_SECTORS}`);
  log.info("");

  // init vars
  let PRGsectorsToUpdate = 0;
  let CHRsectorsToUpdate = 0;

  // loop through PRG sectors
  let offset = 16;
  for (let sector = 0; sector < PRG_SECTORS; sector++) {
    log.print(`Checking PRG-ROM sector ${sector} / ${PRG_SECTORS - 1}...`);
    let start = sector * 64 * 1024;
    for (let byte = 0; byte < 64 * 1024; byte++) {
      if (fOld[start + byte + offset] !== fNew[start + byte + offset]) {
        // log
        log.warning(`PRG sector ${sector} is different...`);

        // append patch header
        fs.writeSync(
          fPatch,
          new Uint8Array([
            0, // PRG-ROM flag
            Math.floor(sector / 2), // 8k bank index (0-63)
            sector % 2, // sector index (0-1)
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
          ])
        );

        // add patch data
        fs.writeSync(
          fPatch,
          fNew.subarray(start + offset, start + offset + 64 * 1024)
        );

        // move to next sector
        PRGsectorsToUpdate++;
        break;
      }
    }
  }

  // loop through CHR sectors
  offset = 16 + CHR_ROM_SIZE;
  for (let sector = 0; sector < CHR_SECTORS; sector++) {
    log.print(`Checking CHR-ROM sector ${sector} / ${CHR_SECTORS - 1}...`);
    let start = sector * 64 * 1024;
    for (let byte = 0; byte < 64 * 1024; byte++) {
      if (fOld[start + byte + offset] !== fNew[start + byte + offset]) {
        // log
        log.warning(`CHR sector ${sector} is different...`);

        // append patch header
        fs.writeSync(
          fPatch,
          new Uint8Array([
            1, // CHR-ROM flag
            sector, // 4K bank index (0-127)
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
          ])
        );

        // add patch data
        fs.writeSync(
          fPatch,
          fNew.subarray(start + offset, start + offset + 64 * 1024)
        );

        // move to next sector
        CHRsectorsToUpdate++;
        break;
      }
    }
  }

  // update header with sector details
  const sectorDetails = new Uint8Array([
    ((PRGsectorsToUpdate + CHRsectorsToUpdate) >> 8) & 0xff,
    (PRGsectorsToUpdate + CHRsectorsToUpdate) & 0xff,
    PRGsectorsToUpdate,
    CHRsectorsToUpdate,
  ]);
  fs.writeSync(fPatch, sectorDetails, 0, 4, 6);

  // close patch file
  fs.closeSync(fPatch);

  // log
  log.print("");
  log.info(
    `${patchFile} created, containing update for ${PRGsectorsToUpdate} PRG-ROM sector(s), and ${CHRsectorsToUpdate} CHR-ROM sector(s)`
  );
};
