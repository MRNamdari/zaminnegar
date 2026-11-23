import type {
  ApplicationError,
  DomainError,
  DrawEngineError,
  ErrorCategory,
  MapEngineError,
  NetworkError,
  PermissionError,
  SyncError,
  ValidationError,
} from "./errors";

/**
 * Every user-facing error text of the editor, in Persian, in this one file.
 *
 * Nothing else may contain error wording: error constructors (`core/errors.ts`) take a `code` plus the typed
 * parameters its entry here declares, and render the message from it. So
 *  - a code without Persian text does not compile (`satisfies ErrorMessageCatalog` below),
 *  - a message that needs a value (a layer, a tool, an area) cannot be built without it,
 *  - to reword or translate an error, this is the only file to edit.
 *
 * Ids and other technical detail never appear in the texts. They travel on the error object instead
 * (`featureId`, `detail`, `cause`) and reach the console reporter, not the user.
 */

/** A text, or a function of the parameters it needs. */
type Entry = string | ((params: never) => string);

type Catalog<Codes extends string> = Readonly<Record<Codes, Entry>>;

export type ErrorMessageCatalog = {
  [C in ErrorCategory]: Catalog<
    C extends "domain"
      ? DomainError["code"]
      : C extends "validation"
        ? ValidationError["code"]
        : C extends "permission"
          ? PermissionError["code"]
          : C extends "application"
            ? ApplicationError["code"]
            : C extends "network"
              ? NetworkError["code"]
              : C extends "map-engine"
                ? MapEngineError["code"]
                : C extends "draw-engine"
                  ? DrawEngineError["code"]
                  : SyncError["code"]
  >;
};

/* ------------------------------ vocabulary ---------------------------------- */

/** Names of the hierarchy levels. The editor's own `Level` values stay English; only their display is Persian. */
const LEVEL_NAME = { region: "منطقه", block: "بلوک", parcel: "قطعه" } as const;
const TOOL_NAME = { select: "انتخاب", polygon: "چندضلعی", rectangle: "مستطیل" } as const;

type LevelKey = keyof typeof LEVEL_NAME;
type ToolKey = keyof typeof TOOL_NAME;

const levelName = (level: string): string => LEVEL_NAME[level as LevelKey] ?? level;
const toolName = (tool: string): string => TOOL_NAME[tool as ToolKey] ?? tool;
/** Persian digits and grouping, e.g. 1500 -> ۱٬۵۰۰ */
const num = (value: number): string => new Intl.NumberFormat("fa-IR").format(value);

/* --------------------------- backend error codes ----------------------------- */

/**
 * Texts for the `code` the backend sends in its error body (`ErrorResponseDto`). The backend's own messages are
 * English and carry ids; these are what users read. A code that is not listed falls back to the generic text of
 * its HTTP status, so a new backend code degrades gracefully instead of breaking.
 */
export const backendMessages = {
  // map
  MAP_FEATURE_NOT_FOUND: "ویژگی پیدا نشد.",
  MULTIPART_FEATURE: "این ویژگی از چند چندضلعی جدا از هم تشکیل شده است و نقشه نمی‌تواند آن را نمایش دهد.",
  // geometry rules
  CHILD_OUTSIDE_GEOMETRY: "با این مرز جدید، بخشی از زیرمجموعه‌های این ویژگی بیرون از آن قرار می‌گیرد.",
  GEOMETRY_OUTSIDE_CONTAINER: "مرز از محدودهٔ ویژگی والد بیرون زده است.",
  GEOMETRY_OVERLAP: "مرز با یکی از ویژگی‌های هم‌سطح همپوشانی دارد.",
  INVALID_BOUNDARY_SOURCE: "منبع مرز معتبر نیست.",
  INVALID_GEOMETRY: "هندسهٔ مرز معتبر نیست.",
  NO_CONTAINING_REGION: "مرز در هیچ‌یک از منطقه‌های این پروژه قرار نمی‌گیرد.",
  PROJECT_MISMATCH: "مورد انتخاب‌شده به همین پروژه تعلق ندارد.",
  BOUNDARY_IN_USE: "این مرز پیش‌تر به یک منطقه، بلوک یا قطعه اختصاص یافته است.",
  BOUNDARY_NOT_FOUND: "مرز پیدا نشد.",
  // regions, blocks, parcels
  REGION_NAME_TAKEN: "منطقه‌ای با این نام در این پروژه وجود دارد.",
  REGION_NOT_EMPTY: "این منطقه هنوز شامل بلوک یا قطعه است و حذف نمی‌شود.",
  REGION_NOT_FOUND: "منطقه پیدا نشد.",
  BLOCK_NAME_TAKEN: "بلوکی با این نام در همین منطقه وجود دارد.",
  BLOCK_NOT_EMPTY: "این بلوک هنوز شامل قطعه است و حذف نمی‌شود.",
  BLOCK_NOT_FOUND: "بلوک پیدا نشد.",
  PARCEL_NAME_TAKEN: "قطعه‌ای با این نام در این پروژه وجود دارد.",
  PARCEL_NOT_FOUND: "قطعه پیدا نشد.",
  // owners
  OWNER_ALREADY_ASSIGNED: "این مالک پیش‌تر در این قطعه سهم دارد.",
  OWNER_HAS_OWNERSHIPS: "این مالک هنوز در قطعه‌ها سهم دارد و حذف نمی‌شود.",
  OWNER_NOT_FOUND: "مالک پیدا نشد.",
  OWNERSHIP_NOT_FOUND: "این مالک در این قطعه سهمی ندارد.",
  SHARES_EXCEEDED: "سهم درخواستی در باقی‌ماندهٔ قطعه نمی‌گنجد.",
  // projects
  NO_ACTIVE_PROJECT: "پروژهٔ فعالی انتخاب نشده است؛ ابتدا یک پروژه را فعال کنید.",
  PROJECT_NAME_TAKEN: "پروژه‌ای با این نام وجود دارد.",
  PROJECT_NOT_EMPTY: "پروژه هنوز منطقه، مرز یا مالک دارد و حذف نمی‌شود.",
  PROJECT_NOT_FOUND: "پروژه پیدا نشد.",
  INVALID_PROJECT_ID: "شناسهٔ پروژه معتبر نیست.",
  // access
  NOT_AUTHENTICATED: "نشست شما منقضی شده است؛ دوباره وارد شوید.",
  PERMISSION_DENIED: "شما اجازهٔ انجام این کار را ندارید.",
  FIELD_NOT_WRITABLE: "اجازهٔ تغییر برخی از فیلدها را ندارید.",
  PERMISSION_NOT_GRANTABLE: "این دسترسی‌ها وجود ندارند یا با نقش پروژه قابل اعطا نیستند.",
  PRIVILEGE_ESCALATION: "نمی‌توانید دسترسی‌هایی را اعطا یا تغییر دهید که خودتان ندارید.",
  RESOURCE_NOT_FOUND: "مورد درخواستی پیدا نشد.",
  ORIGIN_NOT_ALLOWED: "درخواست از این مبدأ مجاز نیست.",
  // roles and members
  ROLE_IN_USE: "این نقش هنوز به اعضا اختصاص دارد.",
  ROLE_NAME_TAKEN: "نقشی با این نام در پروژه وجود دارد.",
  ROLE_NOT_ASSIGNABLE: "این نقش را نمی‌توان در اینجا اختصاص داد.",
  ROLE_NOT_FOUND: "نقش پیدا نشد.",
  SYSTEM_ROLE_IMMUTABLE: "نقش‌های از پیش تعریف‌شده قابل تغییر یا حذف نیستند.",
  LAST_OWNER: "هر پروژه باید دست‌کم یک مالک داشته باشد.",
  LAST_SUPERADMIN: "سامانه باید دست‌کم یک مدیر کل فعال داشته باشد.",
  MEMBER_ALREADY_EXISTS: "این کاربر پیش‌تر عضو پروژه شده است.",
  MEMBER_NOT_FOUND: "این کاربر عضو پروژه نیست.",
  // accounts
  INVALID_CREDENTIALS: "نام کاربری یا گذرواژه نادرست است.",
  INVALID_OTP: "کد واردشده نادرست است یا منقضی شده است.",
  OTP_ATTEMPTS_EXCEEDED: "تعداد تلاش‌های ناموفق زیاد بود؛ کد جدید درخواست کنید.",
  OTP_COOLDOWN: "کد به‌تازگی ارسال شده است؛ پیش از درخواست دوباره کمی صبر کنید.",
  OTP_RATE_LIMITED: "درخواست کد بیش از حد مجاز بود؛ بعداً دوباره تلاش کنید.",
  PHONE_NOT_VERIFIED: "شمارهٔ تلفن این حساب تأیید نشده است.",
  SMS_DELIVERY_FAILED: "ارسال پیامک ناموفق بود.",
  USER_INACTIVE: "این حساب غیرفعال شده است.",
  USER_NOT_FOUND: "کاربر پیدا نشد.",
} as const satisfies Readonly<Record<string, string>>;

export type BackendErrorCode = keyof typeof backendMessages;

/** Backend codes that mean "this outline breaks a geometry rule", which the editor reports as invalid geometry. */
export const GEOMETRY_RULE_CODES: ReadonlySet<string> = new Set<BackendErrorCode>([
  "CHILD_OUTSIDE_GEOMETRY",
  "GEOMETRY_OUTSIDE_CONTAINER",
  "GEOMETRY_OVERLAP",
  "INVALID_GEOMETRY",
  "NO_CONTAINING_REGION",
]);

/** The Persian text of a backend `code`, or `undefined` when the backend sent none or one this catalog does not know. */
export const backendMessage = (code: string | undefined): string | undefined =>
  code !== undefined && Object.hasOwn(backendMessages, code) ? backendMessages[code as BackendErrorCode] : undefined;

/* ------------------------------ editor errors -------------------------------- */

/** What the backend told us about a failure, passed through so the matching text can be chosen. */
type FromBackend = { backendCode?: string | undefined };

/**
 * A 403 usually says only `PERMISSION_DENIED`, which is less informative than the editor's own text for the
 * operation ("you may not edit this feature"). A more specific code (e.g. `FIELD_NOT_WRITABLE`) wins over it.
 */
const denied = (
  params: { session?: "expired" } & FromBackend,
  fallback: string,
): string =>
  params.session === "expired"
    ? backendMessages.NOT_AUTHENTICATED
    : params.backendCode !== "PERMISSION_DENIED"
      ? (backendMessage(params.backendCode) ?? fallback)
      : fallback;

export const errorMessages = {
  domain: {
    feature_not_found: "ویژگی مورد نظر پیدا نشد.",
    session_in_progress: ({ action }: { action: "edit" | "tool" | "layer" | "save" }) =>
      ({
        edit: "ابتدا ویرایش جاری را تمام یا لغو کنید.",
        tool: "ابتدا پیش‌نویس یا ویرایش جاری را تمام یا لغو کنید.",
        layer: "پیش از تغییر لایه، ویرایش جاری را ذخیره یا لغو کنید.",
        save: "ذخیره‌سازی در حال انجام است؛ کمی صبر کنید.",
      })[action],
    no_active_session: ({ what }: { what: "draft" | "edit" | "retry" | "configuration" | "conflict" }) =>
      ({
        draft: "پیش‌نویسی برای ذخیره وجود ندارد.",
        edit: "ویرایشی برای ذخیره وجود ندارد.",
        retry: "عملیاتی برای تلاش مجدد وجود ندارد.",
        configuration: "پیش‌نویسی که منتظر تکمیل اطلاعات باشد وجود ندارد.",
        conflict: "تداخلی برای برطرف‌کردن وجود ندارد.",
      })[what],
    invalid_state: (
      params:
        | { reason: "no_geometry" | "not_retryable" }
        | { reason: "inactive_layer"; layer: string; activeLayer: string },
    ) =>
      params.reason === "inactive_layer"
        ? `این ویژگی به لایهٔ «${levelName(params.layer)}» تعلق دارد، اما لایهٔ «${levelName(params.activeLayer)}» فعال است.`
        : params.reason === "no_geometry"
          ? "این ویژگی هندسه ندارد."
          : "برای این خطا تلاش مجدد ممکن نیست.",
  },

  validation: {
    invalid_schema: ({
      subject,
    }: {
      subject: "create" | "update" | "delete" | "configuration" | "backend_rejected" | "backend_response";
    }) =>
      ({
        create: "درخواست ایجاد معتبر نیست.",
        update: "درخواست ویرایش معتبر نیست.",
        delete: "درخواست حذف معتبر نیست.",
        configuration: "اطلاعات واردشده معتبر نیست.",
        backend_rejected: "سرور اطلاعات ارسالی را نامعتبر دانست.",
        backend_response: "داده‌ای که سرور فرستاد معتبر نیست.",
      })[subject],
    invalid_geometry: ({ backendCode }: FromBackend = {}) =>
      backendMessage(backendCode) ?? "مختصات از محدودهٔ مجاز طول و عرض جغرافیایی بیرون است.",
    unclosed_ring: "نقطهٔ اول و آخر چندضلعی یکی نیستند؛ چندضلعی باید بسته باشد.",
    self_intersection: "ضلع‌های چندضلعی نباید یکدیگر را قطع کنند.",
    area_too_small: ({ minAreaM2 }: { minAreaM2: number }) =>
      `مساحت چندضلعی کمتر از ${num(minAreaM2)} متر مربع است.`,
    invalid_config: "پیکربندی ویرایشگر نقشه معتبر نیست.",
  },

  permission: {
    draw_denied: "ترسیم غیرفعال است.",
    tool_unavailable: ({ tool }: { tool: string }) => `ابزار «${toolName(tool)}» فعال نیست.`,
    create_denied: ({ level, ...rest }: { level?: string; session?: "expired" } & FromBackend = {}) =>
      denied(
        rest,
        level !== undefined ? `ایجاد «${levelName(level)}» مجاز نیست.` : "اجازهٔ ایجاد این ویژگی را ندارید.",
      ),
    edit_denied: (params: { session?: "expired" } & FromBackend = {}) =>
      denied(params, "اجازهٔ ویرایش این ویژگی را ندارید."),
    delete_denied: (params: { session?: "expired" } & FromBackend = {}) =>
      denied(params, "اجازهٔ حذف این ویژگی را ندارید."),
    read_denied: (params: { session?: "expired" } & FromBackend = {}) =>
      denied(params, "اجازهٔ مشاهدهٔ این اطلاعات را ندارید."),
  },

  application: {
    conflict: ({ source }: { source?: "server_changed" } = {}) =>
      source === "server_changed"
        ? "ویژگی روی سرور تغییر کرده است؛ پیش از ذخیره، تداخل را برطرف کنید."
        : "تغییر شما با وضعیت فعلی سرور تداخل دارد.",
    operation_failed: "عملیات به‌طور غیرمنتظره ناموفق بود.",
    rejected: ({
      reason,
      status,
      backendCode,
    }: { reason?: "version_unsupported" | "not_found"; status?: number } & FromBackend = {}) =>
      backendMessage(backendCode) ??
      (reason === "version_unsupported"
        ? "سرور از بررسی نسخه پشتیبانی نمی‌کند؛ این تغییر با تضمین هم‌زمانی درخواست‌شده قابل اعمال نیست."
        : reason === "not_found"
          ? "مورد درخواستی پیدا نشد."
          : status !== undefined
            ? `سرور درخواست را رد کرد (کد وضعیت ${num(status)}).`
            : "درخواست رد شد."),
  },

  network: {
    http: ({
      reason,
      retryAfterSeconds,
    }: { reason?: "server_error" | "rate_limited"; retryAfterSeconds?: number } = {}) =>
      reason === "server_error"
        ? "سرور نتوانست درخواست را پردازش کند."
        : reason === "rate_limited"
          ? retryAfterSeconds !== undefined
            ? `تعداد درخواست‌ها زیاد است؛ ${num(Math.ceil(retryAfterSeconds))} ثانیهٔ دیگر دوباره تلاش کنید.`
            : "تعداد درخواست‌ها زیاد است؛ کمی بعد دوباره تلاش کنید."
          : "در ارتباط با سرور خطایی رخ داد.",
    offline: "ارتباط با سرور برقرار نشد.",
    timeout: ({ reason }: { reason?: "cancelled" } = {}) =>
      reason === "cancelled" ? "درخواست لغو شد." : "زمان درخواست به پایان رسید.",
    invalid_response: "پاسخ سرور معتبر نیست.",
  },

  "map-engine": {
    init_failed: "ساخت نقشه ناموفق بود.",
    not_ready: ({ reason }: { reason?: "destroyed" } = {}) =>
      reason === "destroyed" ? "نقشه بسته شده است." : "نقشه هنوز آماده نیست.",
    command_failed: "اجرای دستور روی نقشه ناموفق بود.",
  },

  "draw-engine": {
    init_failed: "راه‌اندازی ابزار ترسیم ناموفق بود.",
    mode_failed: ({ tool }: { tool: string }) => `فعال‌کردن ابزار «${toolName(tool)}» ناموفق بود.`,
    feature_rejected: ({ reason }: { reason: "invalid_polygon" | "sync" }) =>
      reason === "invalid_polygon"
        ? "شکل ترسیم‌شده چندضلعی معتبری نیست."
        : "ابزار ترسیم برخی از ویژگی‌ها را نپذیرفت.",
    command_failed: ({ action }: { action: "selection" | "undo" | "redo" }) =>
      ({
        selection: "تغییر انتخاب ناموفق بود.",
        undo: "بازگرداندن تغییر ناموفق بود.",
        redo: "اجرای دوبارهٔ تغییر ناموفق بود.",
      })[action],
  },

  synchronization: {
    apply_failed: "همگام‌سازی ویژگی‌ها با ابزار ترسیم ناموفق بود.",
    unknown_feature: "ویژگی ناشناخته است.",
  },
} as const satisfies ErrorMessageCatalog;

export type ErrorMessages = typeof errorMessages;

/** Short headings for the user, one per category (the failure bar and toasts show `title: message`). */
export const categoryTitles = {
  domain: "انجام این کار ممکن نیست",
  validation: "داده یا مرز نامعتبر است",
  permission: "دسترسی مجاز نیست",
  application: "عملیات ناموفق بود",
  network: "مشکل در ارتباط",
  "map-engine": "خطای نقشه",
  "draw-engine": "خطای ترسیم",
  synchronization: "خطای همگام‌سازی",
} as const satisfies Readonly<Record<ErrorCategory, string>>;

/** Title of a version/edit conflict, which is an `application` error with its own heading. */
export const conflictTitle = "تداخل در ویرایش";
