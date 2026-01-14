"use client";

import { useState, useEffect } from "react";
import { supabaseInvitationService } from "@/lib/services/invitation-service";
import { Invitation, InvitationTemplateType } from "@/lib/types";
import { usePermissions } from "@/lib/hooks/use-permissions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail,
  Save,
  Wand2,
  CheckCircle2,
  Calendar,
  Users,
  Building2,
  Heart,
  Loader2,
  Eye,
  Gift,
  Plus,
  Trash2,
  Sparkles,
  Info,
  MapPin,
  MessageSquare,
  QrCode,
  Settings2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import { InvitationDisplay } from "@/components/features/invitation/invitation-display";

const templates: {
  type: InvitationTemplateType;
  label: string;
  icon: any;
  description: string;
}[] = [
  {
    type: "wedding",
    label: "Wedding",
    icon: Heart,
    description: "Elegant and romantic design for your special day.",
  },
  {
    type: "corporate",
    label: "Corporate",
    icon: Building2,
    description: "Professional and clean layout for business events.",
  },
  {
    type: "khitanan",
    label: "Khitanan",
    icon: Users,
    description: "Traditional and warm template for circumcision events.",
  },
  {
    type: "workshop",
    label: "Workshop",
    icon: Calendar,
    description: "Modern and informative design for learning sessions.",
  },
];

export default function InvitationsPage() {
  const [invitation, setInvitation] = useState<Partial<Invitation>>({
    template_type: "wedding",
    title: "",
    content: "",
    metadata: {},
    is_active: true,
  });
  const [savedInvitation, setSavedInvitation] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const { hasPermission } = usePermissions();

  const canEdit = hasPermission("invitations", "edit");

  useEffect(() => {
    const stored = localStorage.getItem("active_event_id");
    if (stored) {
      setActiveEventId(stored);
      loadInvitation(stored);
    } else {
      setLoading(false);
    }
  }, []);

  async function loadInvitation(eventId: string) {
    try {
      const data = await supabaseInvitationService.getInvitationByEventId(
        eventId
      );
      if (data) {
        // Migration: Handle legacy gift_info object structure
        if (
          data.metadata?.gift_info &&
          !Array.isArray(data.metadata.gift_info)
        ) {
          const oldGift = data.metadata.gift_info as any;
          const newGift: any[] = [];

          if (oldGift.bank?.account_no) {
            newGift.push({
              id: crypto.randomUUID(),
              type: "bank",
              name: oldGift.bank.bank_name || "",
              number: oldGift.bank.account_no || "",
              owner_name: oldGift.bank.owner_name || "",
            });
          }

          if (oldGift.ewallet?.no) {
            newGift.push({
              id: crypto.randomUUID(),
              type: "ewallet",
              name: oldGift.ewallet.name || "",
              number: oldGift.ewallet.no || "",
              owner_name: oldGift.ewallet.owner_name || "",
            });
          }

          data.metadata.gift_info = newGift;
        }
        setInvitation(data);
        setSavedInvitation(JSON.stringify(getRelevantData(data)));
      } else {
        // Set default template content
        const defaultTemplates = supabaseInvitationService.getTemplates();
        const defaultData = {
          event_id: eventId,
          template_type: "wedding" as InvitationTemplateType,
          title: defaultTemplates.wedding.title,
          content: defaultTemplates.wedding.content,
          metadata: defaultTemplates.wedding.metadata,
          is_active: true,
        };
        setInvitation(defaultData);
        setSavedInvitation(JSON.stringify(getRelevantData(defaultData)));
      }
    } finally {
      setLoading(false);
    }
  }

  function getRelevantData(inv: any) {
    if (!inv) return null;
    return {
      template_type: inv.template_type,
      title: inv.title,
      content: inv.content,
      metadata: inv.metadata,
      is_active: inv.is_active,
    };
  }

  const hasChanges =
    savedInvitation !== JSON.stringify(getRelevantData(invitation));

  const handleTemplateSelect = (type: InvitationTemplateType) => {
    const defaultTemplates = supabaseInvitationService.getTemplates();
    setInvitation((prev) => ({
      ...prev,
      template_type: type,
      title: defaultTemplates[type].title,
      content: defaultTemplates[type].content,
      metadata: defaultTemplates[type].metadata,
    }));
    toast.info(`Switched to ${type} template`);
  };

  const updateMetadata = (key: string, value: any) => {
    setInvitation((prev) => ({
      ...prev,
      metadata: {
        ...(prev.metadata || {}),
        [key]: value,
      },
    }));
  };

  const updateGiftItem = (id: string, key: string, value: string) => {
    setInvitation((prev: any) => {
      const metadata = prev.metadata || {};
      const giftInfo = (metadata.gift_info || []) as any[];

      const newGiftInfo = giftInfo.map((item) => {
        if (item.id === id) {
          return { ...item, [key]: value };
        }
        return item;
      });

      return {
        ...prev,
        metadata: {
          ...metadata,
          gift_info: newGiftInfo,
        },
      };
    });
  };

  const updateNestedMetadata = (section: string, key: string, value: any) => {
    setInvitation((prev: any) => {
      const meta = prev.metadata || {};
      const sectionData = meta[section] || {};
      return {
        ...prev,
        metadata: {
          ...meta,
          [section]: {
            ...sectionData,
            [key]: value,
          },
        },
      };
    });
  };

  const addGiftItem = () => {
    setInvitation((prev: any) => {
      const metadata = prev.metadata || {};
      const giftInfo = (metadata.gift_info || []) as any[];

      const newItem = {
        id:
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : Math.random().toString(36).substring(2) + Date.now().toString(36),
        type: "bank",
        name: "", // Bank Name or E-Wallet Name
        number: "", // Account No or Phone Number
        owner_name: "",
      };

      return {
        ...prev,
        metadata: {
          ...metadata,
          gift_info: [...giftInfo, newItem],
        },
      };
    });
  };

  const removeGiftItem = (id: string) => {
    setInvitation((prev: any) => {
      const metadata = prev.metadata || {};
      const giftInfo = (metadata.gift_info || []) as any[];

      return {
        ...prev,
        metadata: {
          ...metadata,
          gift_info: giftInfo.filter((item) => item.id !== id),
        },
      };
    });
  };

  const handleSave = async () => {
    if (!activeEventId) {
      toast.error("Please select an active event first");
      return;
    }

    try {
      setSaving(true);
      const updated = await supabaseInvitationService.upsertInvitation({
        event_id: activeEventId,
        template_type: invitation.template_type as InvitationTemplateType,
        title: invitation.title || "",
        content: invitation.content || "",
        metadata: invitation.metadata || {},
        is_active: !!invitation.is_active,
        user_id: "", // Will be set by service
      });
      setInvitation(updated);
      setSavedInvitation(JSON.stringify(getRelevantData(updated)));
      toast.success("Invitation saved successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to save invitation");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!activeEventId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-gray-100 animate-in fade-in zoom-in duration-700">
        <div className="bg-blue-50 p-6 rounded-full mb-6">
          <Mail className="w-12 h-12 text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          No Active Event Selected
        </h2>
        <p className="text-gray-500 mb-8 text-center max-w-sm">
          You need to select an event to manage its invitations.
        </p>
        <Button
          onClick={() => (window.location.href = "/dashboard/events")}
          className="bg-primary shadow-lg shadow-blue-500/30 hover:bg-blue-600"
        >
          Manage Events
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Editor (Left Column) */}
        <div className="xl:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Invitation Management
              </h1>
              <p className="text-gray-500 mt-1">
                Choose a template and customize your digital invitation.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {canEdit && (
                <Button
                  onClick={handleSave}
                  disabled={saving || !hasChanges}
                  className={`min-w-[140px] px-6 h-11 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-sm ${
                    !hasChanges
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-50 cursor-default shadow-none"
                      : "bg-primary text-white hover:bg-blue-600 shadow-blue-500/20 shadow-lg active:scale-[0.98]"
                  }`}
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : !hasChanges ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {saving
                    ? "Saving..."
                    : !hasChanges
                    ? "Published"
                    : "Save Changes"}
                </Button>
              )}
            </div>
          </div>
          <Card className="rounded-[2rem] shadow-[0_2px_40px_-12px_rgba(0,0,0,0.08)] border-gray-100/50 bg-white overflow-hidden">
            <CardHeader className="bg-gray-50/30 px-8 py-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Customize Invitation
                  </CardTitle>
                  <CardDescription>
                    Choose a template and edit the content.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                    Active
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={invitation.is_active}
                      disabled={!canEdit}
                      onChange={(e) =>
                        canEdit &&
                        setInvitation((prev) => ({
                          ...prev,
                          is_active: e.target.checked,
                        }))
                      }
                    />
                    <div
                      className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                        canEdit
                          ? "peer-checked:bg-primary cursor-pointer"
                          : "cursor-not-allowed opacity-60"
                      }`}
                    ></div>
                  </label>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              {/* Template Selection - Moved Inside & Compact */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 ml-1 block pb-1">
                  Select Template
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {templates.map((tmpl) => {
                    const Icon = tmpl.icon;
                    const isSelected = invitation.template_type === tmpl.type;
                    return (
                      <div
                        key={tmpl.type}
                        onClick={() => handleTemplateSelect(tmpl.type)}
                        className={`cursor-pointer transition-all duration-300 rounded-xl border-2 relative group overflow-hidden ${
                          isSelected
                            ? "border-primary bg-primary/5 shadow-md scale-[1.02]"
                            : "border-gray-100 hover:border-blue-200 bg-white hover:shadow-sm"
                        }`}
                      >
                        <div className="p-3 flex flex-col items-center gap-2 text-center">
                          <Icon
                            className={`w-6 h-6 ${
                              isSelected
                                ? "text-primary"
                                : "text-gray-400 group-hover:text-blue-500"
                            }`}
                          />
                          <span
                            className={`text-xs font-bold ${
                              isSelected ? "text-primary" : "text-gray-600"
                            }`}
                          >
                            {tmpl.label}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle2 className="w-5 h-5 text-blue-600 fill-white" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                    Invitation Title
                  </label>
                  <Input
                    value={invitation.title}
                    disabled={!canEdit}
                    onChange={(e) =>
                      setInvitation((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="e.g. The Wedding of John & Jane"
                    className="rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white h-12 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                    Content Body
                  </label>
                  <Textarea
                    value={invitation.content}
                    disabled={!canEdit}
                    onChange={(e) =>
                      setInvitation((prev) => ({
                        ...prev,
                        content: e.target.value,
                      }))
                    }
                    placeholder="Write your invitation message here..."
                    className="rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white min-h-[150px] p-4 text-base leading-relaxed"
                  />
                </div>

                {invitation.template_type === "wedding" && (
                  <div className="space-y-4 pt-4">
                    {/* Couple Details */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-gray-900 flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        Couple Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-sm font-bold text-gray-700 ml-1">
                            Groom Name
                          </label>
                          <Input
                            value={
                              (invitation.metadata as any)?.groom_name || ""
                            }
                            disabled={!canEdit}
                            onChange={(e) =>
                              updateMetadata("groom_name", e.target.value)
                            }
                            placeholder="Groom's Full Name"
                            className="rounded-xl border-gray-100 bg-gray-50/50"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-bold text-gray-700 ml-1">
                            Bride Name
                          </label>
                          <Input
                            value={
                              (invitation.metadata as any)?.bride_name || ""
                            }
                            disabled={!canEdit}
                            onChange={(e) =>
                              updateMetadata("bride_name", e.target.value)
                            }
                            placeholder="Bride's Full Name"
                            className="rounded-xl border-gray-100 bg-gray-50/50"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Holy Matrimony */}
                    <div className="space-y-4 pt-4">
                      <h4 className="font-bold text-gray-900 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        Holy Matrimony
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-sm font-bold text-gray-700 ml-1">
                            Wedding Date
                          </label>
                          <Input
                            value={
                              (invitation.metadata as any)?.wedding_date || ""
                            }
                            disabled={!canEdit}
                            onChange={(e) =>
                              updateMetadata("wedding_date", e.target.value)
                            }
                            placeholder="e.g. Saturday, 20 April 2025"
                            className="rounded-xl border-gray-100 bg-gray-50/50"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-bold text-gray-700 ml-1">
                            Wedding Location
                          </label>
                          <Input
                            value={
                              (invitation.metadata as any)?.wedding_location ||
                              ""
                            }
                            disabled={!canEdit}
                            onChange={(e) =>
                              updateMetadata("wedding_location", e.target.value)
                            }
                            placeholder="Venue Name & Address"
                            className="rounded-xl border-gray-100 bg-gray-50/50"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Wedding Reception */}
                    <div className="space-y-4 pt-4">
                      <h4 className="font-bold text-gray-900 flex items-center gap-2">
                        <Heart className="w-4 h-4 text-primary" />
                        Wedding Reception
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-sm font-bold text-gray-700 ml-1">
                            Reception Date
                          </label>
                          <Input
                            value={
                              (invitation.metadata as any)?.reception_date || ""
                            }
                            disabled={!canEdit}
                            onChange={(e) =>
                              updateMetadata("reception_date", e.target.value)
                            }
                            placeholder="Same as wedding or different"
                            className="rounded-xl border-gray-100 bg-gray-50/50"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-bold text-gray-700 ml-1">
                            Reception Location
                          </label>
                          <Input
                            value={
                              (invitation.metadata as any)
                                ?.reception_location || ""
                            }
                            disabled={!canEdit}
                            onChange={(e) =>
                              updateMetadata(
                                "reception_location",
                                e.target.value
                              )
                            }
                            placeholder="Venue Name & Address"
                            className="rounded-xl border-gray-100 bg-gray-50/50"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Additional Details */}
                    <div className="space-y-4 pt-4">
                      <h4 className="font-bold text-gray-900 flex items-center gap-2">
                        <Info className="w-4 h-4 text-primary" />
                        Additional Information
                      </h4>
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-700 ml-1">
                          Dress Code
                        </label>
                        <Input
                          value={(invitation.metadata as any)?.dress_code || ""}
                          disabled={!canEdit}
                          onChange={(e) =>
                            updateMetadata("dress_code", e.target.value)
                          }
                          placeholder="e.g. Formal / Batik"
                          className="rounded-xl border-gray-100 bg-gray-50/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-4 pt-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                          <Gift className="w-4 h-4 text-primary" />
                          Send Gift Information
                        </h4>
                        <Button
                          type="button"
                          onClick={() => canEdit && addGiftItem()}
                          disabled={!canEdit}
                          variant="outline"
                          size="sm"
                          className="h-8 gap-2 text-primary hover:text-primary hover:bg-blue-50 border-blue-200"
                        >
                          <Plus className="w-4 h-4" />
                          Add Gift
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {((invitation.metadata as any)?.gift_info || []).map(
                          (item: any) => (
                            <div
                              key={item.id}
                              className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 relative group animate-in fade-in slide-in-from-top-2"
                            >
                              {canEdit && (
                                <button
                                  onClick={() => removeGiftItem(item.id)}
                                  className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-8">
                                <div className="space-y-1.5">
                                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    Type
                                  </label>
                                  <select
                                    value={item.type}
                                    disabled={!canEdit}
                                    onChange={(e) =>
                                      updateGiftItem(
                                        item.id,
                                        "type",
                                        e.target.value
                                      )
                                    }
                                    className="w-full flex h-10 w-full items-center justify-between rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    <option value="bank">Bank Account</option>
                                    <option value="ewallet">E-Wallet</option>
                                  </select>
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    {item.type === "bank"
                                      ? "Bank Name"
                                      : "E-Wallet Name"}
                                  </label>
                                  <Input
                                    value={item.name || ""}
                                    disabled={!canEdit}
                                    onChange={(e) =>
                                      updateGiftItem(
                                        item.id,
                                        "name",
                                        e.target.value
                                      )
                                    }
                                    placeholder={
                                      item.type === "bank"
                                        ? "e.g. BCA"
                                        : "e.g. GoPay"
                                    }
                                    className="bg-white border-gray-100"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    {item.type === "bank"
                                      ? "Account Number"
                                      : "Phone Number"}
                                  </label>
                                  <Input
                                    value={item.number || ""}
                                    disabled={!canEdit}
                                    onChange={(e) =>
                                      updateGiftItem(
                                        item.id,
                                        "number",
                                        e.target.value
                                      )
                                    }
                                    placeholder={
                                      item.type === "bank"
                                        ? "1234567890"
                                        : "08123456789"
                                    }
                                    className="bg-white border-gray-100"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    Owner Name
                                  </label>
                                  <Input
                                    value={item.owner_name || ""}
                                    disabled={!canEdit}
                                    onChange={(e) =>
                                      updateGiftItem(
                                        item.id,
                                        "owner_name",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Account Owner Name"
                                    className="bg-white border-gray-100"
                                  />
                                </div>
                              </div>
                            </div>
                          )
                        )}
                        {(!(invitation.metadata as any)?.gift_info ||
                          ((invitation.metadata as any)?.gift_info || [])
                            .length === 0) && (
                          <div className="text-center py-8 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                            <p className="text-sm text-gray-500 mb-2">
                              No gift information added
                            </p>
                            <Button
                              type="button"
                              onClick={() => canEdit && addGiftItem()}
                              disabled={!canEdit}
                              variant="outline"
                              size="sm"
                              className="text-primary hover:bg-blue-50 border-blue-200"
                            >
                              Add Your First Gift Info
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {invitation.template_type !== "wedding" && (
                  <div className="space-y-4 pt-4">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      Event Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-700 ml-1">
                          Event Date
                        </label>
                        <Input
                          value={
                            (invitation.metadata as any)?.wedding_date || ""
                          }
                          disabled={!canEdit}
                          onChange={(e) =>
                            updateMetadata("wedding_date", e.target.value)
                          }
                          placeholder="e.g. Saturday, 20 April 2025"
                          className="rounded-xl border-gray-100 bg-gray-50/50"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-700 ml-1">
                          Event Location
                        </label>
                        <Input
                          value={
                            (invitation.metadata as any)?.wedding_location || ""
                          }
                          disabled={!canEdit}
                          onChange={(e) =>
                            updateMetadata("wedding_location", e.target.value)
                          }
                          placeholder="Venue Name & Address"
                          className="rounded-xl border-gray-100 bg-gray-50/50"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Features Configuration (RSVP, QR, Wishes) */}
                <div className="space-y-4 pt-4">
                  <h4 className="font-bold text-gray-900 flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-primary" />
                    Feature Configuration
                  </h4>

                  {/* RSVP Config */}
                  <div className="bg-gray-50/50 rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="p-4 bg-gray-100/50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-bold text-gray-700">
                          RSVP Section
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500">
                          {(invitation.metadata as any)?.rsvp?.is_active !==
                          false
                            ? "Active"
                            : "Disabled"}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={
                              (invitation.metadata as any)?.rsvp?.is_active !==
                              false
                            }
                            disabled={!canEdit}
                            onChange={(e) => {
                              const val = e.target.checked;
                              updateNestedMetadata("rsvp", "is_active", val);
                              if (!val) {
                                updateNestedMetadata(
                                  "qr_invitation",
                                  "is_active",
                                  false
                                );
                                updateNestedMetadata(
                                  "wishes_section",
                                  "is_active",
                                  false
                                );
                              }
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    </div>

                    {(invitation.metadata as any)?.rsvp?.is_active !==
                      false && (
                      <div className="space-y-6 animate-in slide-in-from-top-2 p-4">
                        {/* Section 1: Invited Guests */}
                        <div className="space-y-4">
                          <h5 className="text-sm font-bold text-gray-900 flex items-center gap-2 pb-1.5">
                            <Users className="w-4 h-4 text-blue-500" />
                            1. Invited Guests
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs text-gray-400 mb-1 block">
                                Guest Name Label
                              </label>
                              <Input
                                value={
                                  (invitation.metadata as any)?.rsvp
                                    ?.guest_name_label || ""
                                }
                                disabled={!canEdit}
                                onChange={(e) =>
                                  updateNestedMetadata(
                                    "rsvp",
                                    "guest_name_label",
                                    e.target.value
                                  )
                                }
                                placeholder="Tamu Undangan"
                                className="bg-white"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs text-gray-400 mb-1 block">
                              Description
                            </label>
                            <Textarea
                              value={
                                (invitation.metadata as any)?.rsvp
                                  ?.description || ""
                              }
                              disabled={!canEdit}
                              onChange={(e) =>
                                updateNestedMetadata(
                                  "rsvp",
                                  "description",
                                  e.target.value
                                )
                              }
                              placeholder="Description text..."
                              className="bg-white min-h-[80px]"
                            />
                          </div>
                        </div>

                        {/* Section 2: RSVP Form */}
                        <div className="space-y-4">
                          <h5 className="text-sm font-bold text-gray-900 flex items-center gap-2 pb-1.5">
                            <Mail className="w-4 h-4 text-rose-500" />
                            2. RSVP Form
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs text-gray-400 mb-1 block">
                                Section Title
                              </label>
                              <Input
                                value={
                                  (invitation.metadata as any)?.rsvp?.title ||
                                  ""
                                }
                                disabled={!canEdit}
                                onChange={(e) =>
                                  updateNestedMetadata(
                                    "rsvp",
                                    "title",
                                    e.target.value
                                  )
                                }
                                placeholder="Konfirmasi Kehadiran"
                                className="bg-white"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs text-gray-400 mb-1 block">
                                Subtitle
                              </label>
                              <Input
                                value={
                                  (invitation.metadata as any)?.rsvp
                                    ?.subtitle || ""
                                }
                                disabled={!canEdit}
                                onChange={(e) =>
                                  updateNestedMetadata(
                                    "rsvp",
                                    "subtitle",
                                    e.target.value
                                  )
                                }
                                placeholder="Mohon konfirmasi kehadiran Anda"
                                className="bg-white"
                              />
                            </div>
                          </div>

                          <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                              Confirmation Options
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1.5 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                <label className="text-xs text-green-600 font-bold flex items-center gap-2">
                                  <CheckCircle2 className="w-3 h-3" />
                                  "Yes" Option
                                </label>
                                <Input
                                  value={
                                    (invitation.metadata as any)?.rsvp
                                      ?.yes_option_label || ""
                                  }
                                  disabled={!canEdit}
                                  onChange={(e) =>
                                    updateNestedMetadata(
                                      "rsvp",
                                      "yes_option_label",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Label: Ya, saya hadir"
                                  className="bg-gray-50/50"
                                />
                                <Input
                                  value={
                                    (invitation.metadata as any)?.rsvp
                                      ?.yes_response_message || ""
                                  }
                                  disabled={!canEdit}
                                  onChange={(e) =>
                                    updateNestedMetadata(
                                      "rsvp",
                                      "yes_response_message",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Response: Sudah tidak sabar!"
                                  className="bg-gray-50/50"
                                />
                              </div>
                              <div className="space-y-1.5 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                <label className="text-xs text-red-500 font-bold flex items-center gap-2">
                                  <Trash2 className="w-3 h-3" />
                                  "No" Option
                                </label>
                                <Input
                                  value={
                                    (invitation.metadata as any)?.rsvp
                                      ?.no_option_label || ""
                                  }
                                  disabled={!canEdit}
                                  onChange={(e) =>
                                    updateNestedMetadata(
                                      "rsvp",
                                      "no_option_label",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Label: Maaf, tidak bisa"
                                  className="bg-gray-50/50"
                                />
                                <Input
                                  value={
                                    (invitation.metadata as any)?.rsvp
                                      ?.no_response_message || ""
                                  }
                                  disabled={!canEdit}
                                  onChange={(e) =>
                                    updateNestedMetadata(
                                      "rsvp",
                                      "no_response_message",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Response: Doa terbaik..."
                                  className="bg-gray-50/50"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4 pt-4">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                Guest Wishes Input
                              </label>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={
                                    (invitation.metadata as any)?.rsvp
                                      ?.show_wishes_input !== false
                                  }
                                  disabled={!canEdit}
                                  onChange={(e) =>
                                    updateNestedMetadata(
                                      "rsvp",
                                      "show_wishes_input",
                                      e.target.checked
                                    )
                                  }
                                  className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                              </label>
                            </div>

                            {(invitation.metadata as any)?.rsvp
                              ?.show_wishes_input !== false && (
                              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1">
                                <label className="text-xs text-gray-400 mb-1 block">
                                  Wishes Field Title
                                </label>
                                <Input
                                  value={
                                    (invitation.metadata as any)?.rsvp
                                      ?.wishes_input_title || ""
                                  }
                                  disabled={!canEdit}
                                  onChange={(e) =>
                                    updateNestedMetadata(
                                      "rsvp",
                                      "wishes_input_title",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Ucapan & Doa"
                                  className="bg-white"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Section 3: QR Invitation */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between pb-1.5">
                            <h5 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                              <QrCode className="w-4 h-4 text-primary" />
                              3. QR Invitation
                            </h5>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={
                                  (invitation.metadata as any)?.qr_invitation
                                    ?.is_active !== false
                                }
                                disabled={!canEdit}
                                onChange={(e) =>
                                  updateNestedMetadata(
                                    "qr_invitation",
                                    "is_active",
                                    e.target.checked
                                  )
                                }
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                          </div>
                          <p className="text-xs text-gray-500">
                            Enable QR code for guest check-in and souvenir
                            redemption.
                          </p>
                        </div>

                        {/* Section 4: Wishes Section */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between pb-1.5">
                            <h5 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-purple-500" />
                              4. Wishes Display Section
                            </h5>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={
                                  (invitation.metadata as any)?.wishes_section
                                    ?.is_active !== false
                                }
                                disabled={!canEdit}
                                onChange={(e) =>
                                  updateNestedMetadata(
                                    "wishes_section",
                                    "is_active",
                                    e.target.checked
                                  )
                                }
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                          </div>
                          {(invitation.metadata as any)?.wishes_section
                            ?.is_active !== false && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1">
                              <div className="space-y-1.5">
                                <label className="text-xs text-gray-400 mb-1 block">
                                  Title
                                </label>
                                <Input
                                  value={
                                    (invitation.metadata as any)?.wishes_section
                                      ?.title || ""
                                  }
                                  disabled={!canEdit}
                                  onChange={(e) =>
                                    updateNestedMetadata(
                                      "wishes_section",
                                      "title",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Ucapan & Doa"
                                  className="bg-white"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-xs text-gray-400 mb-1 block">
                                  Subtitle
                                </label>
                                <Input
                                  value={
                                    (invitation.metadata as any)?.wishes_section
                                      ?.subtitle || ""
                                  }
                                  disabled={!canEdit}
                                  onChange={(e) =>
                                    updateNestedMetadata(
                                      "wishes_section",
                                      "subtitle",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Kiriman hangat dari para sahabat"
                                  className="bg-white"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100 flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h5 className="font-bold text-blue-900 text-sm">
                      Quick Tip
                    </h5>
                    <p className="text-blue-700/70 text-sm leading-relaxed mt-1">
                      You can use variables like{" "}
                      {(() => {
                        const common = ["[Name]", "[Title]"];
                        const specific =
                          invitation.template_type === "wedding"
                            ? [
                                "[Groom]",
                                "[Bride]",
                                "[WeddingDate]",
                                "[WeddingLocation]",
                                "[ReceptionDate]",
                                "[ReceptionLocation]",
                                "[DressCode]",
                              ]
                            : [
                                "[EventDate]",
                                "[EventLocation]",
                                ...(invitation.template_type === "workshop" ||
                                invitation.template_type === "corporate"
                                  ? ["[Topic]"]
                                  : []),
                              ];
                        return [...common, ...specific].map((v, i, arr) => (
                          <span key={v}>
                            <code className="bg-blue-100 px-1 rounded text-blue-800">
                              {v}
                            </code>
                            {i < arr.length - 1 ? ", " : " "}
                          </span>
                        ));
                      })()}
                      in your content. These will be automatically replaced with
                      the actual details when sending the invitation.
                    </p>
                  </div>
                </div>

                {/* Save button removed from here, moved to header */}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Preview (Right Column) */}
        <div className="hidden xl:block xl:col-span-5 sticky top-0">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 px-1 flex items-center gap-2">
              <Eye className="w-5 h-5 text-gray-400" />
              Live Preview
            </h3>
            <div className="relative mx-auto border-gray-900 bg-gray-900 border-[12px] rounded-[2.5rem] h-[640px] w-full max-w-[340px] shadow-xl overflow-hidden ring-1 ring-gray-900/5">
              <div className="h-[32px] w-[3px] bg-gray-800 absolute -start-[15px] top-[72px] rounded-s-lg"></div>
              <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[15px] top-[124px] rounded-s-lg"></div>
              <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[15px] top-[178px] rounded-s-lg"></div>
              <div className="h-[64px] w-[3px] bg-gray-800 absolute -end-[15px] top-[142px] rounded-e-lg"></div>
              <div className="rounded-[2rem] overflow-hidden w-full h-full bg-white">
                <div className="h-full overflow-y-auto no-scrollbar scroll-smooth bg-white">
                  <div className="flex flex-col min-h-full">
                    {/* Header Display */}
                    <InvitationDisplay
                      title={invitation.title || ""}
                      content={invitation.content || ""}
                      templateType={
                        invitation.template_type as InvitationTemplateType
                      }
                      metadata={invitation.metadata || {}}
                      // guestName="Tamu Undangan"
                    />

                    {/* Guest Section Preview */}
                    {(invitation.metadata as any)?.rsvp?.is_active !==
                      false && (
                      <div className="px-6 py-8 space-y-6 bg-white">
                        <div className="text-center space-y-3">
                          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em]">
                            {(invitation.metadata as any)?.rsvp
                              ?.guest_name_label || "Tamu Undangan"}
                          </p>
                          <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                            <div className="relative z-10">
                              <h3 className="text-2xl font-serif font-bold text-gray-900 italic">
                                Nama Tamu
                              </h3>
                              <p className="text-gray-500 text-xs mt-3 leading-relaxed">
                                {(invitation.metadata as any)?.rsvp
                                  ?.description ||
                                  "Merupakan suatu kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir pada acara kami."}
                              </p>
                            </div>
                            <div className="absolute -right-4 -bottom-4 text-gray-100">
                              <Sparkles className="w-12 h-12" />
                            </div>
                          </div>
                        </div>

                        <div className="w-full h-px bg-gray-100" />

                        <div className="space-y-6">
                          <div className="text-center space-y-2">
                            <h4 className="text-lg font-bold text-gray-900 tracking-tight italic font-serif">
                              {(invitation.metadata as any)?.rsvp?.title ||
                                "Konfirmasi Kehadiran"}
                            </h4>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                              {(invitation.metadata as any)?.rsvp?.subtitle ||
                                "Mohon konfirmasi kehadiran Anda"}
                            </p>
                          </div>

                          {/* Dummy RSVP Inputs */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-white opacity-80">
                              <div className="w-5 h-5 rounded-full border-2 border-gray-200" />
                              <div className="flex-1">
                                <span className="block text-sm font-bold text-gray-700">
                                  {(invitation.metadata as any)?.rsvp
                                    ?.yes_option_label || "Ya, saya akan hadir"}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  {(invitation.metadata as any)?.rsvp
                                    ?.yes_response_message ||
                                    "Sudah tidak sabar!"}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-white opacity-80">
                              <div className="w-5 h-5 rounded-full border-2 border-gray-200" />
                              <div className="flex-1">
                                <span className="block text-sm font-bold text-gray-700">
                                  {(invitation.metadata as any)?.rsvp
                                    ?.no_option_label ||
                                    "Maaf, saya tidak bisa hadir"}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  {(invitation.metadata as any)?.rsvp
                                    ?.no_response_message ||
                                    "Doa terbaik untuk mempelai"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Wishes Preview */}
                    {(invitation.metadata as any)?.rsvp?.is_active !== false &&
                      (invitation.metadata as any)?.wishes_section
                        ?.is_active !== false && (
                        <div className="px-6 pb-8 bg-white">
                          <div className="w-full h-px bg-gray-100 mb-8" />
                          <div className="text-center space-y-4">
                            <h4 className="text-lg font-bold text-gray-900 tracking-tight italic font-serif">
                              {(invitation.metadata as any)?.wishes_section
                                ?.title || "Ucapan & Doa"}
                            </h4>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                              {(invitation.metadata as any)?.wishes_section
                                ?.subtitle ||
                                "Kiriman hangat dari para sahabat"}
                            </p>
                            <div className="flex gap-3 overflow-hidden opacity-50">
                              <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl min-w-[200px] text-xs">
                                <p className="font-bold mb-1">Jane Doe</p>
                                <p className="text-gray-500">
                                  Congratulations!
                                </p>
                              </div>
                              <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl min-w-[200px] text-xs">
                                <p className="font-bold mb-1">John Doe</p>
                                <p className="text-gray-500">
                                  Best wishes for both of you.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
