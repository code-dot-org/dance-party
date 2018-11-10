#!/usr/bin/env bash

SIZE=300
RE=[02468]
OUTPUT_DIR_NAME=sprite_sheets
OUTPUT_DIR="./${OUTPUT_DIR_NAME}"
PACKER=/Applications/TexturePacker.app/Contents/MacOS/TexturePacker

# Fix capitalization errors in source content
mv duck/Duck_Drop duck/DUCK_Drop
mv duck/Duck_Thriller duck/DUCK_Thriller
mv cat/CAT_Thisorthat cat/CAT_ThisOrThat
mkdir -p "${OUTPUT_DIR}"

function start_new_directory {
    pushd "${@}" >/dev/null;
    dirs -v;
}
function exit_directory {
    popd "${@}" >/dev/null;
    dirs -v;
}

for CHARACTER in */; {
  if [[ "${CHARACTER}" != "-null-/" ]] && [[ "${CHARACTER}" != "${OUTPUT_DIR_NAME}/" ]]; then
    echo "${CHARACTER}"
    start_new_directory "${CHARACTER}"
    find . -iname '*.png' -exec mogrify -resize "${SIZE}"x"${SIZE}" {} +
    for DANCE in */; {
      "${PACKER}" --disable-rotation --texture-format png8 --png-opt-level 1 --format json-array --data "../${OUTPUT_DIR}/${DANCE%%/}.json" --sheet "../${OUTPUT_DIR}/${DANCE%%/}.png" "${DANCE}"*${RE}.png;
    }
    exit_directory
  fi
}

pushd "${OUTPUT_DIR}" >/dev/null;
pngquant --quality 0-50 --ext "-q50.png" ./*.png
popd >/dev/null;
