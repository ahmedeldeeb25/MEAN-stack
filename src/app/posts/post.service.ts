import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Subject } from "rxjs";
import { map } from "rxjs/operators";
import { Router } from "@angular/router";

import { Post } from "./post.model";
import {environment} from '../../environments/environment';

@Injectable()
export class PostService {

  private baseUrl = environment.apiURL+"posts/"
  private posts: Post[] = [];
  private postsUpdated = new Subject<{ posts: Post[]; total: number }>();

  constructor(private http: HttpClient, private router: Router) {}

  getPosts(page, size) {
    const queryParam = `?page=${page}&size=${size}`;
    this.http
      .get<{ message: string; posts: any; total: number }>(
        this.baseUrl + queryParam
      )
      .pipe(
        map(postData => {
          return {
            posts: postData.posts.map(post => {
              return {
                title: post.title,
                content: post.content,
                id: post._id,
                imagePath: post.imagePath,
                creator: post.creator
              };
            }),
            total: postData.total
          };
        })
      )
      .subscribe(transformedPosts => {
        this.posts = transformedPosts.posts;
        this.postsUpdated.next({
          posts: [...this.posts],
          total: transformedPosts.total
        });
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getPost(id: string) {
    return this.http.get<{
      _id: string;
      title: string;
      content: string;
      imagePath: string;
      creator: string;
    }>( this.baseUrl+ id);
  }

  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append("title", title);
    postData.append("content", content);
    postData.append("image", image, title);
    this.http
      .post<{ message: string; post: Post }>(
        this.baseUrl,
        postData
      )
      .subscribe(responseData => {
        const post: Post = {
          id: responseData.post.id,
          title: title,
          content: content,
          imagePath: responseData.post.imagePath,
          creator: responseData.post.creator
        };
        this.posts.push(post);
        this.postsUpdated.next({
          posts: [...this.posts],
          total: this.posts.length
        });
        this.router.navigate(["/"]);
      });
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;
    if (typeof image === "object") {
      postData = new FormData();
      postData.append("id", id);
      postData.append("title", title);
      postData.append("content", content);
      postData.append("image", image, title);
    } else {
      postData = {
        id: id,
        title: title,
        content: content,
        imagePath: image,
        creator: null
      };
    }
    this.http
      .put(this.baseUrl + id, postData)
      .subscribe(response => {
        const updatedPosts = [...this.posts];
        const oldPostIndex = updatedPosts.findIndex(p => p.id === id);
        const post: Post = {
          id: id,
          title: title,
          content: content,
          imagePath: "",
          creator: null
        };
        updatedPosts[oldPostIndex] = post;
        this.posts = updatedPosts;
        this.postsUpdated.next({
          posts: [...this.posts],
          total: this.posts.length
        });
        this.router.navigate(["/"]);
      });
  }

  deletePost(postId: string) {
    return this.http.delete(this.baseUrl+ postId);
  }
}
