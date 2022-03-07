import { nanoid } from 'nanoid';
import { User } from '../models/user.model';
import WeightModel, { IUserWeight } from '../models/weight.model';

export async function GetWeightsWhere(user: User) {
  const UserWeight = await WeightModel.findOne({ userUid: user._id });

  return (
    UserWeight?.weights
      .filter(Boolean)
      .sort(
        (a, b) =>
          new Date(b?.timestamp).valueOf() - new Date(a?.timestamp).valueOf()
      ) || []
  );
}

export async function AddUserWeights(user: User, weight: IUserWeight) {
  return await WeightModel.findOneAndUpdate(
    { userUid: user._id },
    { userUid: user._id, $push: { weights: { ...weight, uid: nanoid() } } },
    { upsert: true }
  );
}

export async function DeleteUserWeights(uid: string, user: User) {
  const UserWeight = await WeightModel.findOne({ userUid: user._id });

  const filteredSnapshot = UserWeight.weights.filter((w) => w?.uid !== uid);

  return await UserWeight.updateOne({
    $set: { weights: filteredSnapshot },
  });
}

export async function EditUserWeights(uid: string, payload: any, user: User) {
  const UserWeight = await WeightModel.findOne({ userUid: user._id });

  const updated = UserWeight.weights
    .map((value) => {
      const isTarget = value?.uid === uid;
      return isTarget ? { ...value, ...payload } : value;
    })
    .filter(Boolean);

  console.log({ old: UserWeight.weights, updated });

  UserWeight.weights = updated;

  return UserWeight.save();
}
