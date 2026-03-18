"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchCurrentUser, saveAddress, saveProfile } from "@/store/authSlice";
import { Button } from "@/components/ui/button";
import type { AuthUser } from "@/store/types";
import { useToast } from "@/components/ui/toast";

type ProfileForm = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
};

type AddressForm = {
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

type FieldErrors<T> = Partial<Record<keyof T, string>>;

const DEFAULT_ADDRESS: AddressForm = {
  fullName: "",
  phoneNumber: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
};

function splitFullName(fullName: string | undefined) {
  const value = (fullName ?? "").trim();
  if (!value) {
    return { firstName: "", lastName: "" };
  }

  const parts = value.split(/\s+/);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

export default function ProfilePage() {
  const auth = useAppSelector((state) => state.auth);
  const user = auth.user;

  if (!auth.isAuthenticated || !user) {
    return (
      <section className="mx-auto max-w-[1240px] px-4 py-16 md:px-8">
        <div className="rounded border border-black/10 bg-white p-8 text-center">
          <h2 className="text-[var(--color-text-1)]">Sign in to view your profile</h2>
          <p className="mt-3 text-[var(--color-text-2)]">
            Your profile details and saved addresses are available after login.
          </p>
          <div className="mt-6 flex justify-center">
            <Link href="/login">
              <Button variant="primary" size="lg">Go to Login</Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[1240px] px-4 py-12 md:px-8">
      <ProfileEditor key={JSON.stringify(user)} user={user} />
    </section>
  );
}

function ProfileEditor({ user }: { user: AuthUser }) {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const initial = user.fullName.trim().charAt(0).toUpperCase() || "U";
  const fallbackName = splitFullName(user.fullName);

  const [profile, setProfile] = useState<ProfileForm>({
    firstName: user.firstName || fallbackName.firstName,
    lastName: user.lastName || fallbackName.lastName,
    phoneNumber: user.phoneNumber ?? "",
  });
  const [address, setAddress] = useState<AddressForm>(
    user.address
      ? {
          ...DEFAULT_ADDRESS,
          ...user.address,
          addressLine2: user.address.addressLine2 ?? "",
        }
      : {
          ...DEFAULT_ADDRESS,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber ?? "",
        }
  );
  const [profileErrors, setProfileErrors] = useState<FieldErrors<ProfileForm>>({});
  const [addressErrors, setAddressErrors] = useState<FieldErrors<AddressForm>>({});
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [addressMessage, setAddressMessage] = useState<string | null>(null);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isAddressSaving, setIsAddressSaving] = useState(false);

  useEffect(() => {
    void dispatch(fetchCurrentUser());
  }, [dispatch]);

  function validateProfile(values: ProfileForm) {
    const errors: FieldErrors<ProfileForm> = {};

    if (!values.firstName.trim()) errors.firstName = "First name is required.";
    if (!values.lastName.trim()) errors.lastName = "Last name is required.";
    if (values.phoneNumber && !/^[0-9+\-()\s]{7,20}$/.test(values.phoneNumber)) {
      errors.phoneNumber = "Enter a valid phone number.";
    }

    return errors;
  }

  function validateAddress(values: AddressForm) {
    const errors: FieldErrors<AddressForm> = {};

    if (!values.fullName.trim()) errors.fullName = "Full name is required.";
    if (!values.phoneNumber.trim()) errors.phoneNumber = "Phone number is required.";
    if (!values.addressLine1.trim()) errors.addressLine1 = "Address line 1 is required.";
    if (!values.city.trim()) errors.city = "City is required.";
    if (!values.state.trim()) errors.state = "State / Province is required.";
    if (!values.postalCode.trim()) errors.postalCode = "Postal code is required.";
    if (!values.country.trim()) errors.country = "Country is required.";

    return errors;
  }

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();

    const errors = validateProfile(profile);
    setProfileErrors(errors);
    setProfileMessage(null);

    if (Object.keys(errors).length > 0) return;

    setIsProfileSaving(true);
    const result = await dispatch(
      saveProfile({
        firstName: profile.firstName.trim(),
        lastName: profile.lastName.trim(),
        phoneNumber: profile.phoneNumber,
      })
    );
    setIsProfileSaving(false);

    if (saveProfile.fulfilled.match(result)) {
      const fullName = `${profile.firstName} ${profile.lastName}`.trim();
      setAddress((current) => ({
        ...current,
        fullName: current.fullName.trim() ? current.fullName : fullName,
        phoneNumber: current.phoneNumber.trim() ? current.phoneNumber : profile.phoneNumber,
      }));
      setProfileMessage("Profile updated successfully.");
      showToast({
        title: "Profile updated",
        description: "Your personal details were saved successfully.",
        variant: "success",
      });
      return;
    }

    const message = (result.payload as string) || "Failed to save profile.";
    setProfileMessage(message);
    showToast({
      title: "Profile update failed",
      description: message,
      variant: "error",
    });
  }

  async function handleAddressSave(e: React.FormEvent) {
    e.preventDefault();

    const errors = validateAddress(address);
    setAddressErrors(errors);
    setAddressMessage(null);

    if (Object.keys(errors).length > 0) return;

    setIsAddressSaving(true);
    const result = await dispatch(
      saveAddress({
        fullName: address.fullName.trim(),
        phoneNumber: address.phoneNumber.trim(),
        addressLine1: address.addressLine1.trim(),
        addressLine2: address.addressLine2.trim(),
        city: address.city.trim(),
        state: address.state.trim(),
        postalCode: address.postalCode.trim(),
        country: address.country.trim(),
      })
    );
    setIsAddressSaving(false);

    if (saveAddress.fulfilled.match(result)) {
      setAddressMessage("Address updated successfully.");
      showToast({
        title: "Address updated",
        description: "Your saved address was updated successfully.",
        variant: "success",
      });
      return;
    }

    const message = (result.payload as string) || "Failed to save address.";
    setAddressMessage(message);
    showToast({
      title: "Address update failed",
      description: message,
      variant: "error",
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <aside className="rounded border border-black/10 bg-[var(--color-secondary-2)] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary-btn)]">
          Manage Account
        </p>
        <h2 className="mt-3 text-[var(--color-text-1)]">My Profile</h2>
        <p className="mt-3 text-[var(--color-text-2)]">
          Update your personal details and saved delivery address.
        </p>
        <div className="mt-6 space-y-3 overflow-hidden rounded bg-white px-4 py-3">
          <div className="flex justify-center lg:justify-start md:pb-3">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-primary-btn)] text-xl font-semibold text-white shadow-[0_12px_24px_rgba(219,68,68,0.22)]">
              {initial}
            </div>
          </div>
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--color-text-2)]">Signed in as</p>
          <p className="mt-1 font-medium text-[var(--color-text-1)]">{user.fullName}</p>
          <p className="mt-1 text-[var(--color-text-2)]">{user.email}</p>
        </div>
      </aside>

      <div className="space-y-8 lg:col-span-2">
        <form onSubmit={handleProfileSave} className="rounded border border-black/10 bg-white p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-[var(--color-text-1)]">Personal Details</h3>
              <p className="mt-2 text-[var(--color-text-2)]">
                Update the details saved in your account profile.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <Field
              label="First Name"
              value={profile.firstName}
              onChange={(value) => setProfile((current) => ({ ...current, firstName: value }))}
              error={profileErrors.firstName}
            />
            <Field
              label="Last Name"
              value={profile.lastName}
              onChange={(value) => setProfile((current) => ({ ...current, lastName: value }))}
              error={profileErrors.lastName}
            />
            <Field label="Email Address" value={user.email} readOnly helperText="Email cannot be changed." />
            <Field
              label="Phone Number"
              value={profile.phoneNumber}
              onChange={(value) => setProfile((current) => ({ ...current, phoneNumber: value }))}
              error={profileErrors.phoneNumber}
            />
          </div>

          <div className="mt-6 flex items-center justify-between gap-4">
            <p className="text-sm text-[var(--color-text-2)]">{profileMessage ?? " "}</p>
            <Button type="submit" variant="primary" size="lg" disabled={isProfileSaving}>
              {isProfileSaving ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </form>

        <form onSubmit={handleAddressSave} className="rounded border border-black/10 bg-white p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-[var(--color-text-1)]">Address Book</h3>
              <p className="mt-2 text-[var(--color-text-2)]">
                Add or edit the address you want to use later for checkout and order delivery.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <Field
              label="Full Name"
              value={address.fullName}
              onChange={(value) => setAddress((current) => ({ ...current, fullName: value }))}
              error={addressErrors.fullName}
            />
            <Field
              label="Phone Number"
              value={address.phoneNumber}
              onChange={(value) => setAddress((current) => ({ ...current, phoneNumber: value }))}
              error={addressErrors.phoneNumber}
            />
            <Field
              label="Address Line 1"
              value={address.addressLine1}
              onChange={(value) => setAddress((current) => ({ ...current, addressLine1: value }))}
              error={addressErrors.addressLine1}
              className="md:col-span-2"
            />
            <Field
              label="Address Line 2"
              value={address.addressLine2}
              onChange={(value) => setAddress((current) => ({ ...current, addressLine2: value }))}
              className="md:col-span-2"
            />
            <Field
              label="City"
              value={address.city}
              onChange={(value) => setAddress((current) => ({ ...current, city: value }))}
              error={addressErrors.city}
            />
            <Field
              label="State / Province"
              value={address.state}
              onChange={(value) => setAddress((current) => ({ ...current, state: value }))}
              error={addressErrors.state}
            />
            <Field
              label="Postal Code"
              value={address.postalCode}
              onChange={(value) => setAddress((current) => ({ ...current, postalCode: value }))}
              error={addressErrors.postalCode}
            />
            <Field
              label="Country"
              value={address.country}
              onChange={(value) => setAddress((current) => ({ ...current, country: value }))}
              error={addressErrors.country}
            />
          </div>

          <div className="mt-6 flex items-center justify-between gap-4">
            <p className="text-sm text-[var(--color-text-2)]">{addressMessage ?? " "}</p>
            <Button type="submit" variant="primary" size="lg" disabled={isAddressSaving}>
              {isAddressSaving ? "Saving..." : "Save Address"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  helperText,
  readOnly = false,
  className = "",
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  error?: string;
  helperText?: string;
  readOnly?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`.trim()}>
      <label className="text-sm font-medium text-[var(--color-text-1)]">{label}</label>
      <input
        type="text"
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange?.(e.target.value)}
        className={`h-13 rounded border px-4 text-sm outline-none transition-colors ${
          readOnly
            ? "border-black/10 bg-[var(--color-secondary)] text-[var(--color-text-2)]"
            : "border-black/15 bg-white text-[var(--color-text-1)] focus:border-[var(--color-primary-btn)]"
        }`}
      />
      {error ? (
        <span className="text-xs text-[var(--color-primary-btn)]">{error}</span>
      ) : helperText ? (
        <span className="text-xs text-[var(--color-text-2)]">{helperText}</span>
      ) : null}
    </div>
  );
}
