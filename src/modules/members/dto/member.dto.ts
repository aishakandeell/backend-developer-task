export class MemberDTO {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  // Optional here until the model column is added in the model/DB phase.
  subscriptionDate?: string;
  phone?: string;
}
