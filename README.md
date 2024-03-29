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
- Sector data (4096 bytes)  
  
(*sector header* and *sector data* can be repeated)

### Header format

The format of the header is as follows:  

- 0-4: constant $52 $4E $42 $57 $1A ("RNBW" followed by MS-DOS end-of-file)
- 5: number of sectors to update
- 6: number of PRG sectors to update
- 7: number of CHR sectors to update
- 8-15: unused padding (should be filled with zero)

### PRG sector header

The format of the PRG sector header is as follows:

- 0: PRG-ROM (0) flag
- 1: 8K bank index (0-63)
- 2: sector index (0-1)
- 3-15: unused padding (should be filled with zero)

### CHR sector header

The format of the CHR sector header is as follows:

- 0: CHR-ROM (1) flag
- 1: 4K bank index (0-127)
- 2-15: unused padding (should be filled with zero)

### Sector data

Raw data (4096 bytes) to be used to update the cartridge memory.

## CONTACT

> &nbsp;  
> mail: contact@brokestudio.fr  
> twitter: @Broke_Studio  
> &nbsp;
