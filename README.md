# Blog post API

This repo explores creating a simple REST api for managing blog posts. It only
uses only the underlying framework to do this without relying on any other 3rd
party dependencies. The goal of this is to explore whats possible using only the
framework.

## The API

### Listing posts

```
GET /posts
```

Returns a list of all the posts

```json
200
{
  "posts": [
    {
      "id": "280efa6a-8388-4a38-83c0-af5cdecd97d1",
      "title": "My first post"
    }
  ]
}
```

### Adding a post

```
POST /posts
{
  "title": "My first post",
  "body": "Something interesting to say",
  "date": 1661558609
}
```

Saves a new post, date is a unix timestamp. Returns a list of all the posts

```json
201
{
  "posts": [
    {
      "id": "280efa6a-8388-4a38-83c0-af5cdecd97d1",
      "title": "My first post"
    }
  ]
}
```

### Updating a post

```
PUT /posts/${id}
{
  "posts": [
    {
      "id": "280efa6a-8388-4a38-83c0-af5cdecd97d1",
      "title": "My updated first post"
    }
  ]
}
```

Updates a post and returns a list of all the posts

```json
200
{
  "posts": [
    {
      "id": "280efa6a-8388-4a38-83c0-af5cdecd97d1",
      "title": "My updated first post"
    }
  ]
}
```

### Deleting a post

```
DELETE /posts/${id}
```

Deletes the post and returns a list of all the posts

```
200
{
  "posts": []
}
```

### Getting a post

```
GET /posts/${id}
```

Gets the post

```json
200
{
  "id": "68e3ac27-19b1-4a0d-84c3-954c2c42f6ae",
  "title": "My first post",
  "body": "Something interesting to say",
  "date": 1661558609
}
```
