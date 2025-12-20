import { Injectable, inject } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { NetworkStatus, WatchQueryFetchPolicy, OperationVariables } from '@apollo/client/core';
import { Apollo } from 'apollo-angular';
import { DocumentNode } from 'graphql';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class DataService {
    private apollo = inject(Apollo);

    private readonly context =  {
        headers: new HttpHeaders(),
    };

    query<T = any, V extends Record<string, any> = {}>(query: DocumentNode, variables?: V, fetchPolicy?: WatchQueryFetchPolicy): Observable<T> {
        return this.apollo.watchQuery<T, V>({
            query,
            variables: variables as V,
            context: this.context,
            fetchPolicy: fetchPolicy || 'cache-first',
        }).valueChanges.pipe(
            filter(result => result.networkStatus === NetworkStatus.ready),
            map(response => response.data as T));
    }

    mutate<T = any, V extends OperationVariables = any>(mutation: DocumentNode, variables?: V): Observable<T> {
        return this.apollo.mutate<T, V>({
            mutation,
            variables: variables as V,
            context: this.context,
        }).pipe(map(response => response.data as T));
    }
}
