# SPA Note

http://wdpress-vol97-frontend-sample-app.s3-website-ap-northeast-1.amazonaws.com/

- マークダウンでメモが書ける
- URL（`/notes/:id`）を知っていれば誰でも見れる
- Noteにはスターをつけられる
- スターをつけたNoteの一覧が見れる

<table>
  <tr><th>path</th><th>description</th></tr>
  <tr><td>/</td><td>ダッシュボード。自分の記事一覧が見れる</td></tr>
  <tr><td>/notes/:id/edit</td><td>記事の編集。previewもできる</td></tr>
  <tr><td>/starred</td><td>スターした記事の一覧</td></tr>
  <tr><td>/notes/:id</td><td>記事詳細。記事にスターできる</td></tr>
</table>

## Development

```
$ yarn install
$ yarn start
$ open http://localhost:8080/
```
