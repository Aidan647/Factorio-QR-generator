import { deflate, inflate } from "pako";
import { toUint8Array } from "js-base64";
import qrcode from "qrcode";
//@ts-ignore
document.getElementById("selectedTPP").innerHTML = document.getElementById("TPP").value;
const decode = async (data) => {
    return JSON.parse(new TextDecoder().decode(inflate(toUint8Array(data.substring(1)))));
};
const encode = async (data) => {
    return "0" + Buffer.from(deflate(JSON.stringify(data), { level: 9 })).toString("base64");
};
const getSettings = async () => {
    // get settings from fields
    // fields: input, selectErrors, LandFill, FillTile, FillTileId, entity
    const settings = {
        input: document.getElementById("input").value ?? "",
        error: document.getElementById("selectErrors").value,
        entity: document.getElementById("entity").value ?? "stone-wall",
        fillTile: document.getElementById("FillTile").checked ?? false,
        fillTileId: document.getElementById("FillTileId").value ?? "",
        entitiesOnwhite: document.getElementById("entitiesOnwhite").checked ?? false,
        border: document.getElementById("border").checked ?? false,
        TPP: (document.getElementById("TPP").value ?? "1"),
    };
    return settings;
};
const generate = async () => {
    const { input, error, entity, fillTile, fillTileId, entitiesOnwhite, TPP: TPPraw, border } = await getSettings();
    if (input.length === 0) {
        return;
    }
    const TPP = parseInt(TPPraw);
    if (isNaN(TPP) || (TPP !== 1 && TPP !== 2 && TPP !== 3 && TPP !== 4 && TPP !== 5 && TPP !== 6)) {
        return;
    }
    //create qr code from data
    const qr = qrcode.create(input, {
        errorCorrectionLevel: error,
    });
    // create qrcode image
    qrcode.toCanvas(document.getElementById("qrcode"), input, {
        margin: border ? 1 : 0,
        width: Math.floor(Math.min(window.innerWidth / 2 - 10, window.innerHeight / 2 - 10, 300)),
        errorCorrectionLevel: error,
    });
    //  "entities": [
    //   {
    //     "entity_number": 1,
    //     "name": "stone-wall",
    //     "position": {
    //       "x": 0,
    //       "y": 0
    //     }
    // 	}
    // ]
    const entities = [];
    const tiles = [];
    // convert qr code to entities list
    // qr.modules.size is size of canvas
    // qr.modules.data is array of pixels
    for (let x = 0; x < qr.modules.size; x++) {
        for (let y = 0; y < qr.modules.size; y++) {
            if (qr.modules.data[x * qr.modules.size + y] != entitiesOnwhite) {
                // add entities for multiple times according to TPP
                for (let i = 0; i < TPP; i++) {
                    for (let j = 0; j < TPP; j++) {
                        entities.push({
                            entity_number: entities.length + 1,
                            name: entity,
                            position: {
                                x: x * TPP + i - 0.5,
                                y: y * TPP + j - 0.5,
                            },
                        });
                    }
                }
                // entities.push({
                // 	entity_number: entities.length + 1,
                // 	name: entity,
                // 	position: {
                // 		x,
                // 		y,
                // 	},
                // })
            }
        }
    }
    //add 1px border around qr code using x/y -1 and x/y qr.modules.size+1
    if (border && entitiesOnwhite) {
        // add border at -1 x and -1 y and qr.modules.size+1 x and y
        for (let x = -1; x < qr.modules.size + 1; x++) {
            for (let y = -1; y < qr.modules.size + 1; y++) {
                if (x === -1 || x === qr.modules.size || y === -1 || y === qr.modules.size) {
                    // use TPP
                    for (let i = 0; i < TPP; i++) {
                        for (let j = 0; j < TPP; j++) {
                            entities.push({
                                entity_number: entities.length + 1,
                                name: entity,
                                position: {
                                    x: x * TPP + i - 0.5,
                                    y: y * TPP + j - 0.5,
                                },
                            });
                        }
                    }
                }
            }
        }
    }
    if (fillTile) {
        //fill tiles
        for (let x = border ? -1 * TPP : 0; x < (qr.modules.size + (border ? 1 : 0)) * TPP; x++) {
            for (let y = border ? -1 * TPP : 0; y < (qr.modules.size + (border ? 1 : 0)) * TPP; y++) {
                tiles.push({
                    name: fillTileId,
                    position: {
                        x: x - 0.5,
                        y: x - 0.5,
                    },
                });
            }
        }
    }
    // but entities list to blueprint
    const blueprint = {
        blueprint: {
            icons: [
                {
                    signal: {
                        type: "item",
                        name: "stone-wall",
                    },
                    index: 1,
                },
            ],
            entities,
            tiles,
            //add description about qr code generator
            description: "Generated at https://Aidan647.dev/factorio/QR made by Aidan647",
            item: "blueprint",
            label: "QR code",
            version: 281479275151360,
        },
    };
    document.getElementById("result").value = await encode(blueprint);
};
window.generate = generate;
// id= editor
// on click on editor open in new tab where source is result text
document.getElementById("editor").addEventListener("click", () => {
    const result = document.getElementById("result");
    if (result.value.length === 0) {
        return;
    }
    const win = window.open("https://fbe.teoxoy.com/?sorce=" + result.value, "_blank");
});
//# sourceMappingURL=index.js.map