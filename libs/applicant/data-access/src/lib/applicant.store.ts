import { signalStore, withMethods, withState } from '@ngrx/signals';
import { Attachment, RequestQuery, RequestType, ServiceRequest } from '@moamala/shared/models';

export interface ApplicantState {
  requests: ServiceRequest[];
  total: number;
  query: RequestQuery;
  loading: boolean;
  error: string | null;
  draft: ServiceRequest | null;
  draftType: RequestType | null;
  savingDraft: boolean;
  savedAt: string | null;
}

export const initialApplicantState: ApplicantState = {
  requests: [],
  total: 0,
  query: { page: 1, pageSize: 10 },
  loading: false,
  error: null,
  draft: null,
  draftType: null,
  savingDraft: false,
  savedAt: null,
};

export interface OpenDraftParams {
  requestId?: string;
  typeId?: string;
}

export const ApplicantStore = signalStore(
  { providedIn: 'root' },
  withState(initialApplicantState),
  // TODO: implement each method with ApplicantApi and patchState. Task per method:
  //   T2.5 loadMyRequests(query): rxMethod<RequestQuery> -> store the query, set loading,
  //        switchMap to listMine, patch requests/total, record errors (tapResponse helps).
  //        Hint: switchMap cancels a stale request when filters change quickly, like an
  //        AbortController in a React effect cleanup.
  //   T2.3 openDraft({ requestId } | { typeId }): load an existing request, or create a draft for
  //        the type; then load its RequestType into draftType. Resets savedAt.
  //   T2.3 saveDraft(data): rxMethod -> PUT the draft with the current attachments; while saving
  //        set savingDraft; on success patch draft and savedAt (= response.updatedAt).
  //        Use concatMap so saves are applied in order.
  //   T2.3 submit(): submit the current draft, patch it with the response and resolve with it.
  //        Reject with the ApiError body (HttpErrorResponse.error) when the API answers 422.
  //   T2.4 addAttachment(attachment) / removeAttachment(id): update draft.attachments immutably.
  //   Docs: https://ngrx.io/guide/signals/rxjs-integration
  withMethods(() => ({
    loadMyRequests: (_query: RequestQuery): void => undefined,
    openDraft: (_params: OpenDraftParams): Promise<void> => Promise.resolve(),
    saveDraft: (_data: Record<string, unknown>): void => undefined,
    submit: (): Promise<ServiceRequest> => Promise.reject(new Error('TODO T2.3')),
    addAttachment: (_attachment: Attachment): void => undefined,
    removeAttachment: (_attachmentId: string): void => undefined,
  })),
  // TODO(T5.2): add withHooks({ onInit }) that subscribes to RealtimeService.on('request.updated')
  //   (use rxMethod or takeUntilDestroyed) and replaces the matching entry in `requests` and the
  //   `draft` when their ids match, so an approval in another tab shows up immediately.
  //   Docs: https://ngrx.io/guide/signals/signal-store/lifecycle-hooks
);
