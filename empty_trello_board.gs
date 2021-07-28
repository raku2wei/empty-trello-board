const TRELLO_API_HOST = "https://api.trello.com/1";
const DEV_API_KEY = "{APIキー}";
const API_TOKEN = "{トークン}";
const TARGET_BOARD_NAME = "ゴミ箱(完全削除用)";

// ボードを空にする ※この関数を実行する
function emptyTargetBoard() {
  // 1. 全てのボードを取得
  let boards = getAllBoards();
  if (boards == null) {
    return;
  }
  // 2. ボード名から対象のボードを特定して抽出
  let targetBoard = boards.find((v) => v.name == TARGET_BOARD_NAME);
  console.log(targetBoard);
  if (targetBoard == null) {
    // 対象ボードが見つからない場合は何もしない
    return;
  }
  // 3. ボードから全てのリストを取得
  targeetLists = getListsOnBoard(targetBoard);
  console.log(targeetLists);
  if (targeetLists == null || targeetLists.length == 0) {
    return;
  }
  // 4. 取得したリストから、リスト内の全カードを取得し、1件ずつ削除
  targeetLists.forEach((list) => {
    targetCards = getCardsInList(list);
    targetCards.forEach((card) => deleteCard(card));
    // 5. 空にしたリストはアーカイブ(削除機能がないため)
    closeList(list);
  });
}

// 全てのボードを取得
// GET /1/members/me/boards
function getAllBoards() {
  let url =
    TRELLO_API_HOST +
    "/members/me/boards?key=" +
    DEV_API_KEY +
    "&token=" +
    API_TOKEN +
    "&fields=name";

  let result = doRequest(url, "GET");
  if (result == null || result.getContentText().length == 0) {
    return null;
  }
  return JSON.parse(result.getContentText());
}

// ボード内のリストを全て取得
// GET /1/boards/{id}/lists
function getListsOnBoard(board) {
  let url =
    TRELLO_API_HOST +
    "/boards/" +
    board.id +
    "/lists?key=" +
    DEV_API_KEY +
    "&token=" +
    API_TOKEN;

  let result = doRequest(url, "GET");
  if (result == null || result.getContentText().length == 0) {
    return null;
  }
  return JSON.parse(result.getContentText());
}

// 指定したリストをアーカイブ
// PUT /1/lists/{id}/closed
function closeList(list) {
  let url =
    TRELLO_API_HOST +
    "/lists/" +
    list.id +
    "/closed?key=" +
    DEV_API_KEY +
    "&token=" +
    API_TOKEN +
    "&value=true";

  let result = doRequest(url, "PUT");
  if (result == null) {
    return null;
  }
  console.log("リストをアーカイブしました: " + list.name);
}

// 指定したリスト内のカードを全て取得
// GET /1/lists/{id}/cards
function getCardsInList(list) {
  let url =
    TRELLO_API_HOST +
    "/lists/" +
    list.id +
    "/cards?key=" +
    DEV_API_KEY +
    "&token=" +
    API_TOKEN;

  let result = doRequest(url, "GET");
  if (result == null || result.getContentText().length == 0) {
    return null;
  }
  return JSON.parse(result.getContentText());
}

// 指定したカードを削除
// DELETE /1/cards/{id}
function deleteCard(card) {
  let url =
    TRELLO_API_HOST +
    "/cards/" +
    card.id +
    "?key=" +
    DEV_API_KEY +
    "&token=" +
    API_TOKEN;

  let result = doRequest(url, "DELETE");
  if (result != null) {
    console.log("カードを削除しました: " + card.name);
  }
}

// 指定したURLに対し、リクエストを実行する関数
function doRequest(url, method) {
  try {
    let response = UrlFetchApp.fetch(url, { method: method });
    // APIのリクエスト上限に引っかからないように少し待つ
    Utilities.sleep(120);
    return response;
  } catch (e) {
    console.log("エラー : line - " + e.lineNumber + "\n Error: " + e.message);
    return null;
  }
}
