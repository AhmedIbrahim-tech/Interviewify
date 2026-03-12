"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/features/dashboard/DashboardLayout";
import { siteConfig } from "@/config/site";
import { PageHeader } from "@/components/shared/PageHeader";
import {
    User as UserIcon,
    Mail,
    Save,
    Camera,
    MapPin,
    Globe,
    Briefcase,
    Settings,
    Users as UsersIcon,
    FileText,
    Facebook,
    Twitter,
    Youtube,
    Instagram,
} from "lucide-react";
import { accountService, UpdateProfileDto } from "@/services/accountService";
import { uploadService } from "@/services/uploadService";
import { notify } from "@/lib/notify";
import { useAppSelector } from "@/store/hooks";
import { getFileUrl } from "@/config/api";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { updateCredentials } from "@/store/slices/authSlice";

type SettingsTabId = "profile";

const SettingsPage = () => {
    const dispatch = useDispatch();
    const { user, token, refreshToken } = useAppSelector((state) => state.auth);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<SettingsTabId>("profile");
    const [profileData, setProfileData] = useState<UpdateProfileDto>({
        fullName: "",
        email: "",
        profilePicture: "",
    });
    const [counts, setCounts] = useState<{ categories: number; questions: number; users: number | null }>({
        categories: 0,
        questions: 0,
        users: null,
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await accountService.getProfile();
                if (response.isSuccess && response.data) {
                    setProfileData({
                        fullName: response.data.fullName,
                        email: response.data.email,
                        profilePicture: response.data.profilePicture || "",
                    });
                }
            } catch (err) {
                notify.error("Failed to load profile");
            }
        };

        const fetchCounts = async () => {
            try {
                const statsRes = await accountService.getStats();
                if (statsRes.isSuccess && statsRes.data) {
                    setCounts({
                        categories: statsRes.data.categoryCount,
                        questions: statsRes.data.questionCount,
                        users: statsRes.data.userCount ?? null,
                    });
                }
            } catch {
                // leave counts at 0
            }
        };

        fetchProfile();
        fetchCounts();
    }, []);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await accountService.updateProfile(profileData);
            if (response.isSuccess) {
                notify.success("Profile updated successfully");
                if (response.data) {
                    dispatch(
                        updateCredentials({
                            user: {
                                id: Number(response.data.id),
                                name: response.data.fullName,
                                email: response.data.email,
                                role: response.data.role,
                                profilePicture: response.data.profilePicture,
                            },
                            token: token!,
                            refreshToken: refreshToken!,
                        })
                    );
                }
            } else {
                notify.error(response.message || "Update failed");
            }
        } catch (err) {
            notify.error("Operation failed");
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            notify.error("File size exceeds 2MB");
            return;
        }

        setLoading(true);
        try {
            const response = await uploadService.upload(file, "profiles");
            if (response.isSuccess && response.data) {
                const imageUrl = response.data;
                const updateRes = await accountService.updateProfile({
                    ...profileData,
                    profilePicture: imageUrl,
                });

                if (updateRes.isSuccess) {
                    notify.success("Image updated successfully");
                    setProfileData((prev) => ({ ...prev, profilePicture: imageUrl }));

                    if (user) {
                        dispatch(
                            updateCredentials({
                                user: { ...user, profilePicture: imageUrl },
                                token: token!,
                                refreshToken: refreshToken!,
                            })
                        );
                    }
                } else {
                    notify.error(updateRes.message || "Failed to update profile");
                }
            } else {
                notify.error(response.message || "Upload failed");
            }
        } catch (err) {
            notify.error("Upload failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <PageHeader
                title="Account Settings"
                breadcrumbs={[{ label: "Dashboard" }, { label: "Account Settings" }]}
            />

            <div className="page-settings__header-card">
                <div className="page-settings__cover">
                    <Image
                        src="/images/profile-wallpaper.png"
                        alt="Cover"
                        fill
                        className="page-settings__cover-img"
                        unoptimized
                    />
                    <div className="page-settings__cover-overlay" aria-hidden />
                </div>

                <div className="page-settings__meta">
                    <div className="page-settings__meta-grid">
                        <div className="page-settings__stats-row">
                            <div className="page-settings__stat">
                                <FileText size={18} className="page-settings__stat-icon" />
                                <p className="page-settings__stat-value">{counts.categories}</p>
                                <p className="page-settings__stat-label">Categories</p>
                            </div>
                            <div className="page-settings__stat">
                                <UsersIcon size={18} className="page-settings__stat-icon" />
                                <p className="page-settings__stat-value">{counts.questions}</p>
                                <p className="page-settings__stat-label">Questions</p>
                            </div>
                            <div className="page-settings__stat">
                                <UserIcon size={18} className="page-settings__stat-icon" />
                                <p className="page-settings__stat-value">{counts.users ?? "—"}</p>
                                <p className="page-settings__stat-label">Users</p>
                            </div>
                        </div>

                        <div className="page-settings__avatar-col">
                            <div className="page-settings__avatar-wrap">
                                <div className="page-settings__avatar-ring">
                                    <div className="page-settings__avatar-inner">
                                        {profileData.profilePicture ? (
                                            <Image
                                                src={getFileUrl(profileData.profilePicture)}
                                                alt="Avatar"
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="page-settings__avatar-placeholder">
                                                <UserIcon size={48} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <label className="page-settings__avatar-btn">
                                    <Camera size={16} />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                </label>
                            </div>
                            <div className="page-settings__name">
                                <h2 className="page-settings__name-title">
                                    {profileData.fullName || "User Name"}
                                </h2>
                                <p className="page-settings__name-role">{user?.role || "Designer"}</p>
                            </div>
                        </div>

                        <div className="page-settings__socials-row">
                            <button type="button" className="page-settings__social-btn" aria-label="Facebook">
                                <Facebook size={14} fill="currentColor" />
                            </button>
                            <button type="button" className="page-settings__social-btn" aria-label="Twitter">
                                <Twitter size={14} fill="currentColor" />
                            </button>
                            <button type="button" className="page-settings__social-btn" aria-label="YouTube">
                                <Youtube size={14} fill="currentColor" />
                            </button>
                            <button type="button" className="page-settings__social-btn" aria-label="Instagram">
                                <Instagram size={14} />
                            </button>
                        </div>
                    </div>

                    <div className="page-settings__tabs-wrap">
                        <div className="page-settings__tabs no-scrollbar">
                            <button
                                type="button"
                                onClick={() => setActiveTab("profile")}
                                className={`page-settings__tab ${activeTab === "profile" ? "page-settings__tab--active" : "page-settings__tab--inactive"}`}
                            >
                                <Settings size={16} />
                                Settings
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="page-settings__content-grid">
                <div className="page-settings__content-left">
                    <div className="page-settings__intro-card">
                        <h3 className="page-settings__intro-title">Introduction</h3>
                        <p className="page-settings__intro-desc">
                            Hello, I am {profileData.fullName}. I'm a passionate developer focused on building
                            scalable interview systems.
                        </p>
                        <div className="page-settings__intro-list">
                            <div className="page-settings__intro-item">
                                <div className="page-settings__intro-icon">
                                    <Briefcase size={16} />
                                </div>
                                <span className="page-settings__intro-text">
                                    Engineer at <strong>{siteConfig.name}</strong>
                                </span>
                            </div>
                            <div className="page-settings__intro-item">
                                <div className="page-settings__intro-icon">
                                    <Mail size={16} />
                                </div>
                                <span className="page-settings__intro-text">{profileData.email}</span>
                            </div>
                            <div className="page-settings__intro-item">
                                <div className="page-settings__intro-icon">
                                    <Globe size={16} />
                                </div>
                                <span className="page-settings__intro-text">www.interviewify.local</span>
                            </div>
                            <div className="page-settings__intro-item">
                                <div className="page-settings__intro-icon">
                                    <MapPin size={16} />
                                </div>
                                <span className="page-settings__intro-text">Cairo, Egypt</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="page-settings__content-right">
                    <div className="page-settings__spacer">
                        <div className="page-settings__form-card">
                            <div className="page-settings__form-header">
                                <h3 className="page-settings__form-title">Account Settings</h3>
                            </div>
                            <form onSubmit={handleUpdateProfile} className="page-settings__form-body">
                                <div className="page-settings__form-grid">
                                    <div className="page-settings__field">
                                        <label className="page-settings__label">Full Name</label>
                                        <input
                                            type="text"
                                            value={profileData.fullName}
                                            onChange={(e) =>
                                                setProfileData({ ...profileData, fullName: e.target.value })
                                            }
                                            className="page-settings__input"
                                        />
                                    </div>
                                    <div className="page-settings__field">
                                        <label className="page-settings__label">Email Address</label>
                                        <input
                                            type="email"
                                            value={profileData.email}
                                            onChange={(e) =>
                                                setProfileData({ ...profileData, email: e.target.value })
                                            }
                                            className="page-settings__input"
                                        />
                                    </div>
                                </div>
                                <div className="page-settings__form-actions">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="page-settings__submit"
                                    >
                                        <Save size={16} />
                                        {loading ? "Saving..." : "Save Profile"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SettingsPage;
