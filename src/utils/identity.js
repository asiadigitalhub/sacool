import { fetchReticulumAuthenticated } from "./phoenix-utils";
import defaultAvatar from "../assets/models/DefaultAvatar.glb";
import configs from "./configs";
// get beer labels
var beerLabelJSON = configs.feature("beer_labels");
beerLabelJSON = beerLabelJSON.replaceAll('\\"','"');
console.log("beerLabelJSON ",beerLabelJSON);
const beerLabels = JSON.parse((beerLabelJSON != null && beerLabelJSON != undefined) ? beerLabelJSON : "[]");
// receive beer labels, if they is empty then get human names
const names = beerLabels.length > 0 ? beerLabels :
[
  "Đặng Tuấn Anh",
  "Hoàng Đức Anh",
  "Phạm Hoàng Anh",
  "Đỗ Hoàng Gia Bảo",
  "Trần Thị Minh Châu",
  "Tăng Phương Chi",
  "Phạm Tiến Dũng",
  "Nguyễn Thái Dương",
  "Mạc Trung Đức",
  "Vũ Hương Giang",
  "Nguyễn Thị Ngân Hà",
  "Nguyễn Lê Hiếu",
  "Trần An Dương",
  "Khoa Minh Hoàng",
  "Nguyễn Mạnh Hùng",
  "Phạm Gia Minh",
  "Đỗ Hoàng Mỹ",
  "Nguyễn Công Thành",
  "Bùi Phương Thảo",
  "Tô Diệu Thảo",
  "Đặng Huyền Thi",
  "Đặng Thành Trung",
  "Trịnh Thiên Trường",
  "Lê Khánh Vy",
  "Phạm Vũ Ngọc Diệp",
  "Trần Đức Dương",
  "Trần Kim Ngân",
  "Đỗ Minh Ngọc",
  "Bùi Khánh Ngọc",
  "Trần Uyên Nhi",
  "Phạm Đặng Gia Như",
  "Lê Tất Hoàng Phát",
  "Đào Tuấn Phong",
  "Nguyễn Phú Hải Phong",
  "Trần Trung Phong",
  "Bùi Thành Tài",
  "Đặng Thanh Thảo",
  "Dương Phúc Thịnh",
  "Nguyễn Minh Thư",
  "Bùi Trung Minh Trí",
  "Hoàng Quốc Trung",
  "Vũ Hữu Minh Tường",
  "Lê Thị Phương Vy",
  "Hoàng Trung Dũng",
  "Phạm Anh Duy",
  "Bùi Công Duy",
  "Bùi Nhật Dương",
  "Đỗ Duy Hải",
  "Lương Bảo Hân",
  "Trần Đức Nam",
  "Trần Vũ Hà Ngân",
  "Nguyễn Đăng Phong",
  "Nguyễn Đức Gia Hòa",
  "Đào Thanh Huy",
  "Đào Nguyên Gia Huy",
  "Lê Hoàng Hưng",
  "Đoàn Vĩnh Hưng",
  "Vũ Thiện Khiêm",
  "Đoàn Bá Khuyến",
  "Vũ Tú Linh",
  "Nguyễn Như Mai"
];

// [
//   "Baers-Pochard",
//   "Baikal-Teal",
//   "Barrows-Goldeneye",
//   "Blue-Billed",
//   "Blue-Duck",
//   "Blue-Winged",
//   "Brown-Teal",
//   "Bufflehead",
//   "Canvasback",
//   "Cape-Shoveler",
//   "Chestnut-Teal",
//   "Chiloe-Wigeon",
//   "Cinnamon-Teal",
//   "Comb-Duck",
//   "Common-Eider",
//   "Common-Goldeneye",
//   "Common-Merganser",
//   "Common-Pochard",
//   "Common-Scoter",
//   "Common-Shelduck",
//   "Cotton-Pygmy",
//   "Crested-Duck",
//   "Crested-Shelduck",
//   "Eatons-Pintail",
//   "Falcated",
//   "Ferruginous",
//   "Freckled-Duck",
//   "Gadwall",
//   "Garganey",
//   "Greater-Scaup",
//   "Green-Pygmy",
//   "Grey-Teal",
//   "Hardhead",
//   "Harlequin",
//   "Hartlaubs",
//   "Hooded-Merganser",
//   "Kelp-Goose",
//   "King-Eider",
//   "Lake-Duck",
//   "Laysan-Duck",
//   "Lesser-Scaup",
//   "Long-Tailed",
//   "Maccoa-Duck",
//   "Mallard",
//   "Mandarin",
//   "Marbled-Teal",
//   "Mellers-Duck",
//   "Merganser",
//   "Northern-Pintail",
//   "Orinoco-Goose",
//   "Paradise-Shelduck",
//   "Plumed-Whistler",
//   "Puna-Teal",
//   "Pygmy-Goose",
//   "Radjah-Shelduck",
//   "Red-Billed",
//   "Red-Crested",
//   "Red-Shoveler",
//   "Ring-Necked",
//   "Ringed-Teal",
//   "Rosy-Billed",
//   "Ruddy-Shelduck",
//   "Salvadoris-Teal",
//   "Scaly-Sided",
//   "Shelduck",
//   "Shoveler",
//   "Silver-Teal",
//   "Smew",
//   "Spectacled-Eider",
//   "Spot-Billed",
//   "Spotted-Whistler",
//   "Steamerduck",
//   "Stellers-Eider",
//   "Sunda-Teal",
//   "Surf-Scoter",
//   "Tufted-Duck",
//   "Velvet-Scoter",
//   "Wandering-Whistler",
//   "Whistling-duck",
//   "White-Backed",
//   "White-Cheeked",
//   "White-Winged",
//   "Wigeon",
//   "Wood-Duck",
//   "Yellow-Billed"
// ];

function chooseRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateRandomName() {
  return `${chooseRandom(names)}-${Math.floor(10000 + Math.random() * 10000)}`;
}

export async function fetchRandomDefaultAvatarId() {
  const defaultAvatarEndpoint = "/api/v1/media/search?filter=default&source=avatar_listings";
  const defaultAvatars = (await fetchReticulumAuthenticated(defaultAvatarEndpoint)).entries || [];
  if (defaultAvatars.length === 0) {
    // If reticulum doesn't return any default avatars, just default to the duck model. This should only happen
    // when running against a fresh reticulum server, e.g. a local ret instance.
    return new URL(defaultAvatar, location.href).href;
  }
  const avatarIds = defaultAvatars.map(avatar => avatar.id);
  return chooseRandom(avatarIds);
}
