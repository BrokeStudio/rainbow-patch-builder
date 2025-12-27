# RAINBOW PATCH TOOL

This tool creates a patch file, between two NES ROMs, to be used with the Rainbow bootloader (or with your own code).

## HOW TO INSTALL

Run `npm install -g` in this folder to make this tool available from everywhere

## HOW TO USE

Simply run:

`rainbow patch [oldFile] [newfile] [patchFile]`

Arguments:

- oldFile - old NES ROM filename
- newFile - new NES ROM filename
- patchFile - output patch filename (optional, default will be patch.bin)

## PATCH FILE FORMAT

A patch file consists of the following sections, in order:

- Header (16 bytes)
- Sector header (16 bytes)
- Sector data (65536 bytes)

(_sector header_ and _sector data_ can be repeated)

### Header format

The format of the header is as follows:

- bytes 0-4: constant $52 $4E $42 $57 $1A ("RNBW" followed by MS-DOS end-of-file)
- 5: patch file version (should be 0 for now)
- 6-7: number of sectors to update (MSB-LSB)
- 8: number of PRG sectors to update
- 9: number of CHR sectors to update
- 10-15: unused padding (should be filled with zero)

### Sector header

The format of the PRG sector header is as follows:

- byte 0: ROM destination flag (0: PRG-ROM, 1: CHR-ROM)
- byte 1: 64K sector index (0-127)
- bytes 2-15: unused padding (should be filled with zero)

### Sector data

Raw data (65536 bytes) to be used to update the cartridge memory.

## CONTACT

> &nbsp;  
> mail: contact@brokestudio.fr  
> twitter: @Broke_Studio  
> &nbsp;
