import {AssessmentDto, UserDm} from "@/_models";
import {Observable, Subject} from "rxjs";
import UserRoles = UserDm.UserRoles;


function buildUserIndex(allowedUsers: UserDm.User[] | string[]): Set<string> {
  const userIndex = new Set<string>();
  (allowedUsers || []).forEach(user => {
    const id = typeof user === "string" ? user : user._id
    userIndex.add(id)
  })
  return userIndex;
}

export class ManageAssessmentModel {
  private userAccessIndex: Set<string>;
  private _userAccessChanges = new Subject<string[]>()

  constructor(private assessment: AssessmentDto) {
    this.userAccessIndex = buildUserIndex(assessment.accessControl.allowedUsers);
  }

  isAccessAllowedForUser(user: UserDm.User) {
    return this.assessment.accessControl.allowAll ||
      this.userAccessIndex.has(user._id) ||
        user.hasAtleastRole(UserRoles.Owner);
  }

  changeAccessForUser(allowed: boolean, user: UserDm.User | string) {
    this.internalChangeAccessForUser(allowed, user);
    this.emitChangeEvent();
  }

  changeAccessForAll(allowed: boolean, users: UserDm.User[]) {
    (users || []).forEach(user => {
      this.internalChangeAccessForUser(allowed, user);
    })
    this.emitChangeEvent();
  }

  get userAccessChanges(): Observable<string[]> {
    return this._userAccessChanges;
  }

  private emitChangeEvent() {
    this._userAccessChanges.next(
      Array.from(this.userAccessIndex.values())
    );
  }

  private internalChangeAccessForUser(allowed: boolean, user: UserDm.User | string) {
    const id = typeof user === "string"? user : user._id;
    if (allowed) {
      this.userAccessIndex.add(id);
    } else {
      this.userAccessIndex.delete(id);
    }
  }
}


